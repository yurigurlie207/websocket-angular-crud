import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-registration',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './registration.component.html',
    styleUrls: []
  })
  export class RegistrationComponent {
    userData = { username: '', password: '' };
  
    constructor(private authService: AuthService, private router: Router) { }
  
    register() {
      this.authService.register(this.userData)
        .subscribe({
          next: (response) => {
            // Option 1: Redirect to login page
            this.router.navigate(['/login']);
            // Option 2: Auto-login (call this.authService.login(...) here)
          },
          error: (error) => {
            // Handle registration error (e.g., display error message)
          }
        });
    }
  }