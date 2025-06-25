import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {type Todo, TodoStore} from "./store";
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component'; 
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule, LoginComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [TodoStore]
})

export class AppComponent {


  newTodoText = new FormControl('');

  constructor(readonly todoStore: TodoStore) {
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
    this.todoStore.update(todo); // This should emit the update to the server
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

  remove(todo: Todo){
    this.todoStore.remove(todo);
  }

  addTodo() {
    if (this.newTodoText.value?.trim().length) {
      this.todoStore.add(this.newTodoText.value!);
      this.newTodoText.setValue('');
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    // Optionally redirect to login
  }

  // ngAfterViewInit() {
  //   this.labelRefs.forEach((labelRef) => {
  //     const el = labelRef.nativeElement as HTMLElement;
  //     console.log(el.textContent?.trim())
  //     if (el.textContent?.trim() === 'Hi-Pri') {
  //       el.classList.add('highlightGreen');
  //     }
  //   });
  // }
  
}

