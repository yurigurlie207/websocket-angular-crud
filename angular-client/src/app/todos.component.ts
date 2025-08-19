import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { type Todo, TodoStore } from "./store";
import { AuthService } from './auth.service';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
  providers: [TodoStore]
})
export class TodosComponent {
  newTodoText = new FormControl('');

  constructor(
    readonly todoStore: TodoStore,
    private auth: AuthService,
    private router: Router
  ) {}

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
} 