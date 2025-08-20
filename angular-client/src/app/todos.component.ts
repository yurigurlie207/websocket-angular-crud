import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { type Todo, TodoStore } from "./store";
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
  providers: [TodoStore, AuthService]
})
export class TodosComponent implements OnInit {
  newTodoText = new FormControl('');
  availableUsers: Array<{username: string}> = [];

  constructor(
    readonly todoStore: TodoStore,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadAvailableUsers();
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
} 