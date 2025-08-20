import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./app.component.css']
})

export class LoginComponent {
  username = '';
  password = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    console.log('Login attempt for user:', this.username);
    this.error = '';
    this.success = '';
    
    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        console.log('Token received:', response.token);
        this.auth.setToken(response.token);
        this.auth.setUsername(this.username); // Store the username
        console.log('Token stored, checking localStorage...');
        console.log('Stored token:', localStorage.getItem('token'));
        this.success = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/todos']); // Redirect to todos page
        }, 1000);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err.error?.error || 'Login failed';
      }
    });
  }
}