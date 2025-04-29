import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {type Todo, TodoStore} from "./store";
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [TodoStore]
})

export class AppComponent {
  @ViewChild('priorityLabel') labelRef!: ElementRef;
  newTodoText = new FormControl('');

  constructor(readonly todoStore: TodoStore) {
  }

  stopEditing(todo: Todo, editedTitle: string) {
    todo.title = editedTitle;
    todo.editing = false;
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

  ngAfterViewInit() {
    console.log("HM")
    const labelEl = this.labelRef.nativeElement as HTMLElement;

    if (labelEl.textContent?.trim() === 'Hi-Pri') {
      labelEl.classList.add('highlightGreen');
    }
  }
  
}


// window.addEventListener("DOMContentLoaded", () => {
//   const label = document.getElementById("priority") as HTMLElement | null;

//   console.log(label);

//   if (label && label.textContent?.trim() === "Hi-Pri") {
//     label.classList.add("highlightGreen");
//   }
// });