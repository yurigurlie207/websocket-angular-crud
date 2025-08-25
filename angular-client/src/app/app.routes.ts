import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/registration.component').then(m => m.RegistrationComponent) },
  { path: 'todos', loadComponent: () => import('./components/todos.component').then(m => m.TodosComponent) },
  { path: 'profile', loadComponent: () => import('./components/profile.component').then(m => m.ProfileComponent) }
];