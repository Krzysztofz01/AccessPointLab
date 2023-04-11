import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navigation-wrapper',
  templateUrl: './navigation-wrapper.component.html',
  styleUrls: ['./navigation-wrapper.component.css']
})
export class NavigationWrapperComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  public getServerName(): string {
    return this.authService.getServerName();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

}
