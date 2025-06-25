import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./app.component.css']
})

export class LoginComponent {
//  @ViewChild(AppComponent) childComponent!: AppComponent;

  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        this.auth.setToken(response.token);
        this.router.navigate(['/']); // Redirect to main page or todos
      },
      error: (err) => {
        this.error = err.error || 'Login failed';
      }
    });
  }

}