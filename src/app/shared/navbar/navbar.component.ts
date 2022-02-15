import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() animatedBackground: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  public getServerName(): string {
    return this.authService.getServerName();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
