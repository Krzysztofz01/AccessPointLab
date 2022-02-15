import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const authPath = route.url.some(p => p.path === 'auth');
    const userInstance = this.authService.userValue;
    
    if (authPath) {
      if (!userInstance) return true;

      this.router.navigate(['']);
      return false;
    }

    if (!userInstance) {
      this.router.navigate(['/auth']);
      return false;
    }

    return true;
  }
}
