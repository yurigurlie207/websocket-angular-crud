import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { type Todo, TodoStore } from "../models/store";
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ClaudeService, PrioritizedTodo } from '../services/claude.service';
import { UserPreferences } from '../models/store';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
  providers: [AuthService]
})
export class TodosComponent implements OnInit {
  newTodoText = new FormControl('');
  availableUsers: Array<{username: string}> = [];
  aiInsights: string = '';
  isAILoading: boolean = false;

  constructor(
    readonly todoStore: TodoStore,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private claudeService: ClaudeService
  ) {}

  ngOnInit() {
    // Initialize the store if user is authenticated
    this.todoStore.initializeIfAuthenticated();
    this.loadAvailableUsers();
    this.loadUserPreferences();
  }

  loadAvailableUsers() {
    const token = this.auth.getToken();
    console.log('Loading available users, token:', token ? 'present' : 'missing');
    if (token) {
      console.log('Token value:', token);
      console.log('Making request to:', `${environment.serverUrl}/users`);
      const headers = { 'Authorization': `Bearer ${token}` };
      console.log('Request headers:', headers);
      this.http.get<Array<{username: string}>>(`${environment.serverUrl}/users`, {
        headers: headers
      }).subscribe({
        next: (users) => {
          console.log('Users loaded successfully:', users);
          this.availableUsers = users;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error details:', err);
        }
      });
    }
  }

  getCurrentUsername(): string {
    return this.auth.getUsername() || 'Unknown User';
  }

  stopEditing(todo: Todo, editedTitle: string) {
    todo.title = editedTitle;
    todo.editing = false;
    this.todoStore.update(todo);
  }

  cancelEditingTodo(todo: Todo) {
    todo.editing = false;
  }

  updateEditingTodo(todo: Todo, editedTitle: string) {
    editedTitle = editedTitle.trim();
    todo.editing = false;

    if (editedTitle.length === 0) {
      return this.todoStore.remove(todo);
    }

    todo.title = editedTitle;
    this.todoStore.update(todo);
  }

  updatePriority(todo: Todo) {
    this.todoStore.update(todo);
  }

  updateAssignment(todo: Todo) {
    this.todoStore.update(todo);
  }

  editTodo(todo: Todo) {
    todo.editing = true;
  }

  removeCompleted() {
    this.todoStore.removeCompleted();
  }

  toggleCompletion(todo: Todo) {
    this.todoStore.toggleCompletion(todo);
  }

  remove(todo: Todo) {
    this.todoStore.remove(todo);
  }

  addTodo() {
    if (this.newTodoText.value?.trim().length) {
      this.todoStore.add(this.newTodoText.value!);
      this.newTodoText.setValue('');
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  

  prioritizeWithAI() {
    this.isAILoading = true;
    const todos = this.todoStore.todos.filter(todo => !todo.completed);
    
    this.claudeService.prioritizeTodos(todos, this.todoStore.getUserPreferences()).subscribe({
      next: (prioritizedTodos: PrioritizedTodo[]) => {
        // Update todos with AI priority
        prioritizedTodos.forEach(prioritizedTodo => {
          const todo = this.todoStore.todos.find(t => t.id === prioritizedTodo.id);
          if (todo) {
            (todo as any).aiPriority = prioritizedTodo.aiPriority;
            (todo as any).aiReason = prioritizedTodo.aiReason;
          }
        });
        
        // Sort todos by AI priority
        this.todoStore.todos.sort((a, b) => {
          const aPriority = (a as any).aiPriority || 999;
          const bPriority = (b as any).aiPriority || 999;
          return aPriority - bPriority;
        });
        
        this.isAILoading = false;
      },
      error: (err) => {
        console.error('Error prioritizing with AI:', err);
        this.isAILoading = false;
      }
    });
  }

  getAIInsights() {
    const todos = this.todoStore.todos.slice(-10); // Last 10 todos
    
    this.claudeService.getTaskInsights(todos, this.todoStore.getUserPreferences()).subscribe({
      next: (insight: string) => {
        this.aiInsights = insight;
      },
      error: (err) => {
        console.error('Error getting AI insights:', err);
      }
    });
  }

  getAIPriority(todo: Todo): number | null {
    return (todo as any).aiPriority || null;
  }

  getAIReason(todo: Todo): string | null {
    return (todo as any).aiReason || null;
  }
} 