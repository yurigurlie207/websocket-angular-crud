import { io, Socket } from "socket.io-client";
import { ClientEvents, ServerEvents } from "../../../../common/events";
import { environment } from '../../environments/environment';
import {Injectable} from "@angular/core";
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

export interface UserPreferences {
  petCare: boolean;
  laundry: boolean;
  cooking: boolean;
  organization: boolean;
  plantCare: boolean;
  houseWork: boolean;
  yardWork: boolean;
  familyCare: boolean;
}

export interface Todo {
  id: string,
  createdBy: string,
  assignedTo: string,
  title: string,
  priority: string,
  completed: boolean,
  editing: boolean,
  synced: boolean
}

// Interface for server communication
interface TodoPayload {
  title: string,
  priority: string,
  completed: boolean,
  createdBy?: string,
  assignedTo?: string
}

const mapTodo = (todo: any) => {
  return {
    ...todo,
    editing: false,
    synced: true
  }
}

@Injectable()
export class TodoStore {
  public todos: Array<Todo> = [];
  public userPreferences: UserPreferences = {
    petCare: false,
    laundry: false,
    cooking: false,
    organization: true,
    plantCare: false,
    houseWork: false,
    yardWork: false,
    familyCare: false
  };
  private socket?: Socket<ServerEvents, ClientEvents>;

  constructor(private authService: AuthService, private http: HttpClient) {
    // Initialize when user is authenticated
    this.initializeIfAuthenticated();
  }

  initializeIfAuthenticated() {
    const token = this.authService.getToken();
    if (token && !this.socket) {
      this.initializeSocket(token);
    }
  }

  private initializeSocket(token: string) {
    this.socket = io(environment.socketUrl, {
      auth: {
        token: token
      }
    });

    this.socket!.on("connect", () => {
      this.socket!.emit("todo:list", (res) => {
        if ("error" in res) {
          // handle the error
          return;
        }
        this.todos = res.data.map(mapTodo);

        //not sure if this is where I should be sorting - i think this needs to happen else where
        this.todos.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

        const priorityOrder: { [key: string]: number } = {
          'Hi-Pri': 1,
          'Medium': 2,
          'Low': 3
        };
        this.todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // console.log(this.todos)
        
      });
    });

    this.socket.on("todo:created", (todo) => {
      this.todos.push(mapTodo(todo));
    });

    this.socket.on("todo:updated", (todo) => {
      const existingTodo = this.todos.find(t => {
        return t.id === todo.id
      });
      if (existingTodo) {
        existingTodo.title = todo.title;
        existingTodo.priority = todo.priority;
        existingTodo.completed = todo.completed;
      }
    });

    this.socket.on("todo:deleted", (id) => {
      const index = this.todos.findIndex(t => {
        return t.id === id
      });
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    })

    // Load user preferences on initialization
    this.loadUserPreferences();
  }

  private isSocketInitialized(): boolean {
    return this.socket !== undefined;
  }

  // User Preferences Management
  loadUserPreferences() {
    const token = this.authService.getToken();
    if (token) {
      this.http.get<UserPreferences>(`${environment.serverUrl}/user/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (preferences) => {
          this.userPreferences = preferences;
          console.log('User preferences loaded:', preferences);
        },
        error: (err) => {
          console.error('Error loading user preferences:', err);
          // Keep default preferences if loading fails
        }
      });
    }
  }

  updateUserPreferences(preferences: UserPreferences) {
    const token = this.authService.getToken();
    if (token) {
      this.http.put(`${environment.serverUrl}/user/preferences`, preferences, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.userPreferences = preferences;
          console.log('User preferences updated:', preferences);
        },
        error: (err) => {
          console.error('Error updating user preferences:', err);
        }
      });
    }
  }

  getUserPreferences(): UserPreferences {
    return this.userPreferences;
  }

  private getWithCompleted(completed: boolean) {
    return this.todos.filter((todo: Todo) => todo.completed === completed);
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length;
  }

  setAllTo(completed: boolean) {
    if (!this.socket) return;
    
    this.todos.forEach(todo => {
      todo.completed = completed;
      todo.synced = false;
      this.socket!.emit("todo:update", todo, (res) => {
        if (res && "error" in res) {
          // handle the error
          return;
        }
        todo.synced = true;
      });
    });
  }

  removeCompleted() {
    if (!this.socket) return;
    
    this.getCompleted().forEach((todo) => {
      this.socket!.emit("todo:delete", todo.id, (res) => {
        if (res && "error" in res) {
          // handle the error
        }
      });
    })
    this.todos = this.getRemaining();
  }

  getRemaining() {
    return this.getWithCompleted(false);
  }

  getCompleted() {
    return this.getWithCompleted(true);
  }

  toggleCompletion(todo: Todo) {
    if (!this.socket) return;
    
    todo.completed = !todo.completed;
    todo.synced = false;
    this.socket!.emit("todo:update", todo, (res) => {
      if (res && "error" in res) {
        // handle the error
        return;
      }
      todo.synced = true;
    })
  }

  remove(todo: Todo) {
    if (!this.socket) return;
    
    this.todos.splice(this.todos.indexOf(todo), 1);
    this.socket!.emit("todo:delete", todo.id, (res) => {
      if (res && "error" in res) {
        // handle the error
      }
    });
  }

  add(title: string, assignedTo?: string) {
    if (!this.socket) return;
    
    const currentUser = this.authService.getUsername() || '';
    const assignedUser = assignedTo || currentUser;
    
    const todoPayload: TodoPayload = { 
      title, 
      priority: "Hi-Pri", 
      completed: false,
      createdBy: currentUser,
      assignedTo: assignedUser
    };
    
    this.socket!.emit("todo:create", todoPayload, (res) => {
      if ("error" in res) {
        // handle the error
        return;
      }
      this.todos.push({
        id: res.data,
        createdBy: currentUser,
        assignedTo: assignedUser,
        title,
        priority: "Hi-Pri",
        completed: false,
        editing: false,
        synced: true
      });

      //This will make sure the sort happens when anything new is added will be sorted
      //however this needs to also be fed back to the server somewhere, and i did not take care of that yet
      this.todos.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      const priorityOrder: { [key: string]: number } = {
        'Hi-Pri': 1,
        'Medium': 2,
        'Low': 3
      };
      this.todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    });
  }

  update(todo: Todo) {
    if (!this.socket) return;
    
    this.socket!.emit("todo:update", todo, (res) => {
      if (res && "error" in res) {
        // handle the error
        return;
      }
      todo.synced = true;
    });
  }
}

