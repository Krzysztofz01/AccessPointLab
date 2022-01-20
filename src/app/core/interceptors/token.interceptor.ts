import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { GlobalScopeService } from '../services/global-scope.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private server: string;

  constructor(private authService: AuthService, private globalScopeService: GlobalScopeService) {
    this.globalScopeService.server.subscribe(server => this.server = server);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.authService.userValue;
    const isLoggedIn = user && user.jwt;
    const isApiUrl = request.url.startsWith(this.server);

    if(isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${ user.jwt }` }
      });
    }

    return next.handle(request);
  }
}
