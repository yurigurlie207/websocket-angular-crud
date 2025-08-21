import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

interface UserPreferences {
  petCare: boolean;
  laundry: boolean;
  cooking: boolean;
  organization: boolean;
  plantCare: boolean;
  houseWork: boolean;
  yardWork: boolean;
  familyCare: boolean;
}

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
    private http: HttpClient
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
    const token = this.authService.getToken();
    
    this.http.get<UserPreferences>(`${environment.serverUrl}/user/preferences`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (prefs) => {
        this.preferences = { ...this.preferences, ...prefs };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading preferences:', err);
        this.loading = false;
        // If preferences don't exist yet, we'll use defaults
      }
    });
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
    
    const token = this.authService.getToken();
    
    this.http.put(`${environment.serverUrl}/user/preferences`, this.preferences, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.success = 'Preferences saved successfully!';
        this.isEditing = false;
        this.loading = false;
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving preferences:', err);
        this.error = 'Failed to save preferences. Please try again.';
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToTodos() {
    this.router.navigate(['/todos']);
  }
}
