import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { RegisterRequest } from 'src/app/auth/contracts/register.request';
import { AuthService } from 'src/app/auth/services/auth.service';
import { GlobalScopeService } from 'src/app/core/services/global-scope.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { RegisterModalComponent } from './register-modal/register-modal.component';

@Component({
  selector: 'app-auth',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private globalScopeService: GlobalScopeService,
    private loggerService: LoggerService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      server: new FormControl('', [ Validators.required ]),
      email: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(6) ])
    });

    this.initializeRefreshToken();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
  * Method called on login button click, check form valiation and make the auth request
  */
  public loginSubmit(): void {
    if (!this.loginForm.valid) {
      this.toastService.setError("Provided authentication credentails are invalid.");
      this.loginForm.reset();
      return;
    }

    this.globalScopeService.setServer(this.loginForm.get('server').value);

    this.authService.login({
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }).pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => {
        this.toastService.setInformation("Authenticated successful.");
        this.router.navigate(['']);
      },
      error: (error) => {
        this.loggerService.logError(error);
        this.toastService.setError("Account does not exist or has not been activated yet.");
      }
    });

    this.loginForm.reset();
  }

  /**
  * This method is opening the registration modal component and handling the registration request 
  */
  public register(): void {
    const ref = this.modalService.open(RegisterModalComponent);

    ref.result.then(res => {
      const registerData = res as RegisterRequest;
      if (registerData === null) {
        this.toastService.setError("Provided authentication credentails are invalid.");
        return;
      }

      this.authService.register(registerData).pipe(takeUntil(this.destroy$)).subscribe({
        complete: () => {
          this.toastService.setInformation("Registration successful. Wait for account activation.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Registration failed. Try again later.");
        }
      });
    }, () => {});
  }

  /**
  * Check for a pending session and authenticate.
  */
  private initializeRefreshToken(): void {
    if(!this.authService.verifyLocalStorageTokens()) return;

    this.authService.refreshToken().pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => {
        this.toastService.setInformation("Authenticated successful.");
        this.router.navigate(['']);
      },
      error: (error) => {
        this.loggerService.logError(error);
        this.toastService.setError("Invalid session. Try to authenticate again.");
      }
    });
  }
}
