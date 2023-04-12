import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navigation-wrapper',
  templateUrl: './navigation-wrapper.component.html',
  styleUrls: ['./navigation-wrapper.component.css']
})
export class NavigationWrapperComponent {

  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Get a boolean value representing if the user is authenticated
   * @returns Boolean value representing if the user is authenticated 
   */
  public isAuthenticated(): boolean {
    if (!this.authService.userValue) return false;
    
    return true;
  }

  /**
   * Get the server name
   * @returns Server name value as string
   */
  public getServerName(): string {
    return this.authService.getServerName();
  }

  /**
   * Perform the logout via the authservice and redirect to authentication page
   */
  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
