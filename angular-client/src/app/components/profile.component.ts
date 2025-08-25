import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TodoStore, UserPreferences } from '../models/store';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  preferences: UserPreferences = {
    petCare: false,
    laundry: false,
    cooking: false,
    organization: true,
    plantCare: false,
    houseWork: false,
    yardWork: false,
    familyCare: false
  };
  
  isEditing = false;
  error = '';
  success = '';
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient,
    private todoStore: TodoStore
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.authService.getUsername() || '';
    this.loadUserPreferences();
  }

  loadUserPreferences() {
    this.loading = true;
    // Get preferences from the store
    this.preferences = { ...this.todoStore.getUserPreferences() };
    this.loading = false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset to original values if canceling
      this.loadUserPreferences();
    }
  }

  savePreferences() {
    this.loading = true;
    this.error = '';
    this.success = '';
    
    // Update preferences through the store
    this.todoStore.updateUserPreferences(this.preferences);
    this.success = 'Preferences saved successfully!';
    this.isEditing = false;
    this.loading = false;
    setTimeout(() => {
      this.success = '';
    }, 3000);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToTodos() {
    this.router.navigate(['/todos']);
  }
}
