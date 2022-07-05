import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { GlobalScopeService } from 'src/app/core/services/global-scope.service';
import { LoginRequest } from '../contracts/login.request';
import { LoginResponse } from '../contracts/login.response';
import { PasswordResetRequest } from '../contracts/password-reset.request';
import { RefreshResponse } from '../contracts/refresh.response';
import { AuthUser } from '../models/auth-user.model';
import jwt_decode  from 'jwt-decode';
import { RegisterRequest } from '../contracts/register.request';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { RefreshRequest } from '../contracts/refresh.request';
import { LogoutRequest } from '../contracts/logout.request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<AuthUser>;
  public user: Observable<AuthUser>;

  private readonly authVersion = 1;
  
  private server: string;
  private serverPath: string;

  private refreshTokenTimeout: any;

  constructor(private router: Router, private httpClient: HttpClient, private globalScopeService: GlobalScopeService, private localStorageService: LocalStorageService) {
    this.userSubject = new BehaviorSubject<AuthUser>(undefined);
    this.user = this.userSubject.asObservable();
    
    this.globalScopeService.server.subscribe(server => {
      if (server === null) return;
      
      this.server = server;
      this.serverPath = `${server}/api/v${this.authVersion}/auth`;
    });
  }

  /**
   * Get the stripped server url
   * @returns Server url
   */
  public getServerName(): string {
    return this.server;
  }

  /**
  * Get user value from the beahavior subject
  * @returns AuthUser model encoded into JWT
  */
  public get userValue(): AuthUser {
    return this.userSubject.value;
  }

  /**
  * Authenticate using login credentials
  * @param contract Login request contract
  * @returns Login response as a observable
  */
  public login(contract: LoginRequest): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(this.serverPath, contract, { withCredentials: true })
      .pipe(map(res => {
        const authUser = this.mapAuthUser(res.jsonWebToken);

        this.localStorageService.set({
          key: environment.LSK_REFRESH_TOKEN,
          value: res.refreshToken,
          expirationMinutes: null,
        });

        this.userSubject.next(authUser);
        this.startRefreshTokenTimer();
        return res;
      }));
  }

  /**
  * Authenticate using refresh token
  * @returns Refresh response as a observable
  */
   public refreshToken(): Observable<RefreshResponse> {
    const refreshRequest: RefreshRequest = {
      refreshToken: this.localStorageService.get(environment.LSK_REFRESH_TOKEN)
    };

    return this.httpClient.post<RefreshResponse>(`${ this.serverPath }/refresh`, refreshRequest, { withCredentials: true })
      .pipe(map(res => {
        const authUser = this.mapAuthUser(res.jsonWebToken);
        
        this.localStorageService.set({
          key: environment.LSK_REFRESH_TOKEN,
          value: res.refreshToken,
          expirationMinutes: null,
        });

        this.userSubject.next(authUser);
        this.startRefreshTokenTimer();
        return res;
      }));
  }

  /**
   * Check if there is a session to refresh
   * @returns Boolean value indicating the presence of auth token
   */
  public verifyLocalStorageTokens(): boolean {
    return this.localStorageService.check(environment.LSK_REFRESH_TOKEN) &&
      this.localStorageService.check(environment.LSK_SERVER);
  }

  /**
  * Revoke the refresh token and remove related tokens from local storage
  */
  public logout(): void {
    const logoutRequest: LogoutRequest = {
      refreshToken: this.localStorageService.get(environment.LSK_REFRESH_TOKEN)
    };

    this.httpClient.post(`${ this.serverPath }/logout`, logoutRequest, { withCredentials: true }).subscribe({
      complete: () => {
        this.stopRefreshTokenTimer();
        this.userSubject.next(null);

        this.localStorageService.unset(environment.LSK_REFRESH_TOKEN);
        this.localStorageService.unset(environment.LSK_SERVER);

        this.router.navigate(['/auth']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  /**
  * Register new account
  * @returns Register response as a observable
  */
  public register(contract: RegisterRequest): Observable<void> {
    return this.httpClient.post<void>(`${ this.serverPath }/register`, contract, { withCredentials: true });
  }

  /**
  * Change the current user password and revoke
  */
  public passwordReset(contract: PasswordResetRequest): void {
    this.httpClient.post(`${ this.serverPath }/reset`, contract, { withCredentials: true }).subscribe({
      complete: () => {
        this.stopRefreshTokenTimer();
        this.userSubject.next(null);
        
        this.localStorageService.unset(environment.LSK_REFRESH_TOKEN);
        this.localStorageService.unset(environment.LSK_SERVER);

        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private startRefreshTokenTimer(): void {
    const payload: any = jwt_decode(this.userValue.jwt);
    const expires: Date = new Date(payload.exp * 1000);
    const timeout = expires.getTime() * Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer(): void {
    clearTimeout(this.refreshTokenTimeout);
  }

  private mapAuthUser(jwt: string): AuthUser {
    const payload: any = jwt_decode(jwt);
    return { 
      jwt: jwt,
      id: payload.nameid,
      role: payload.role,
      email: payload.email,
      name: payload.uniquie_name
    };
  }
}