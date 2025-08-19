import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-registration',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './registration.component.html',
    styleUrls: []
  })
  export class RegistrationComponent {
    userData = { username: '', password: '' };
    error = '';
    success = '';
    
    constructor(private authService: AuthService, private router: Router) { }
  
    register() {
      console.log('Registering user:', this.userData);
      this.authService.register(this.userData)
        .subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.success = 'Registration successful! Redirecting to login...';
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err) => {
            console.error('Registration error:', err);
            this.error = err.error?.error || 'Registration failed';
          }
        });
    }
  }