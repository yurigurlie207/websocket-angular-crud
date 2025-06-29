import { io, Socket } from "socket.io-client";
import { ClientEvents, ServerEvents } from "../../../common/events";
import { environment } from '../environments/environment';
import {Injectable} from "@angular/core";

export interface Todo {
  id: string,
  title: string,
  priority: string,
  completed: boolean,
  editing: boolean,
  synced: boolean
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
  private socket: Socket<ServerEvents, ClientEvents>;

  constructor() {
    this.socket = io(environment.serverUrl);

    this.socket.on("connect", () => {
      this.socket.emit("todo:list", (res) => {
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
  }

  private getWithCompleted(completed: boolean) {
    return this.todos.filter((todo: Todo) => todo.completed === completed);
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length;
  }

  setAllTo(completed: boolean) {
    this.todos.forEach(todo => {
      todo.completed = completed;
      todo.synced = false;
      this.socket.emit("todo:update", todo, (res) => {
        if (res && "error" in res) {
          // handle the error
          return;
        }
        todo.synced = true;
      });
    });
  }

  removeCompleted() {
    this.getCompleted().forEach((todo) => {
      this.socket.emit("todo:delete", todo.id, (res) => {
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
    todo.completed = !todo.completed;
    todo.synced = false;
    this.socket.emit("todo:update", todo, (res) => {
      if (res && "error" in res) {
        // handle the error
        return;
      }
      todo.synced = true;
    })
  }

  remove(todo: Todo) {
    this.todos.splice(this.todos.indexOf(todo), 1);
    this.socket.emit("todo:delete", todo.id, (res) => {
      if (res && "error" in res) {
        // handle the error
      }
    });
  }

  add(title: string) {
    this.socket.emit("todo:create", { title, priority: "Hi-Pri", completed: false }, (res) => {
      if ("error" in res) {
        // handle the error
        return;
      }
      this.todos.push({
        id: res.data,
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
    this.socket.emit("todo:update", todo, (res) => {
      if (res && "error" in res) {
        // handle the error
        return;
      }
      todo.synced = true;
    });
  }
}

