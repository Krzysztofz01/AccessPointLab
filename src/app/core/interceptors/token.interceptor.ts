import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, concatMap, delay, Observable, of, retryWhen, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { GlobalScopeService } from '../services/global-scope.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing: boolean;
  private server: string;

  private readonly refreshRetryCount = 3;
  private readonly refreshRetryDelayMs = 1500;

  constructor(private authService: AuthService, private globalScopeService: GlobalScopeService) {
    this.globalScopeService.server.subscribe(server => this.server = server);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isRequestBackendTargeted = request.url.startsWith(this.server);

    // Checking if the user is "client-side" authentication is setup 
    if (this.isClientSizeSessionValid() && isRequestBackendTargeted) {
      // Injecting the auth JWT into the request headers
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${ this.getUserJwt() }` }
      });
    }

    // Passing the request, catching errors...
    return next.handle(request).pipe(catchError(error => {
      // [401] Unauthroized - No token present or the token is invalid
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Trying to refresh the token (3 retires) then call the original request
        return this.handleTokenRefreshing(request, next).pipe(
          retryWhen(error => error.pipe(
            concatMap((error, count) => {
              if (count <= this.refreshRetryCount) {
                return of(error);
              }
              return throwError(() => error)
            }),
            delay(this.refreshRetryDelayMs)
          ))
        )
      }

      // [4**] Request failed, throwing the exception
      return throwError(() => error);
    }));
  }

  private isClientSizeSessionValid(): boolean {
    const user = this.authService.userValue;
    return user !== null && user.jwt !== null;
  }

  private getUserJwt(): string {
    const user = this.authService.userValue;
    return user.jwt;
  }

  private handleTokenRefreshing(request: HttpRequest<any>, next: HttpHandler) {
    // Check if there is a refreshing performed right now to avoid race condition
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      // One more check if the "client-side" authentication is setup
      if (!this.isClientSizeSessionValid()) {
        this.authService.clientSideLogout();
        return throwError(() => new Error("You must be authenticated to perform this operation."));
      }

      this.authService.refreshToken().pipe(
        switchMap(() => {
          // Refreshing was successful 
          this.isRefreshing = false;

          // Updating the request JWT
          request = request.clone({
            setHeaders: { Authorization: `Bearer ${this.getUserJwt()}` }
          });

          // Passing the request
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;

          // If the response is 401/403 the refresh token is no loger valid causing a client side logout
          if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
            this.authService.clientSideLogout();
            return throwError(() => new Error("You must be authenticated to perform this operation."));
          }

          // Some other problem occured, return the error
          return throwError(() => new Error("Authentication token refreshing failed."));
        })
      );
    }

    return next.handle(request);
  }
}
