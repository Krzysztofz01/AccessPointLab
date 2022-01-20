import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterRequest } from 'src/app/auth/contracts/register.request';
import { AuthService } from 'src/app/auth/services/auth.service';
import { GlobalScopeService } from 'src/app/core/services/global-scope.service';
import { RegisterModalComponent } from './register-modal/register-modal.component';

@Component({
  selector: 'app-auth',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;

  public notificationShow: boolean;
  public notificationText: string;
  public notificationType: string = 'danger';

  constructor(private authService: AuthService, private router: Router, private modalService: NgbModal, private globalScopeService: GlobalScopeService) { }

  ngOnInit(): void {
    this.notificationShow = false;

    this.loginForm = new FormGroup({
      server: new FormControl('', [ Validators.required ]),
      email: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(6) ])
    });

    this.initializeRefreshToken();
  }

  /**
  * Method called on login button click, check form valiation and make the auth request
  */
  public loginSubmit(): void {
    this.notificationShow = false;
    
    if (!this.loginForm.valid) {
      this.notificationShow = true;
      this.notificationType = 'danger';
      this.notificationText = 'Provided data invalid!';

      this.loginForm.reset();
      return;
    }

    this.globalScopeService.setServer(this.loginForm.get('server').value);

    this.authService.login({
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }).subscribe({
      complete: () => {
        this.router.navigate(['']);
      },
      error: (error) => {
        console.error(error);
        this.notificationShow = true;
        this.notificationType = 'danger';
        this.notificationText = 'Check the provided data. Your account may not be activated yet!';
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
        this.notificationShow = true;
        this.notificationType = 'danger';
        this.notificationText = 'Provided data invalid!';
        return;
      }

      this.authService.register(registerData).subscribe({
        complete: () => {
          this.notificationShow = true;
          this.notificationType = 'success';
          this.notificationText = 'Registration successful. Wait for account activation.';
        },
        error: (error) => {
          console.error(error);
        }
      });
    }, () => {});
  }

  /**
  * Check for a pending session and authenticate.
  */
  private initializeRefreshToken(): void {
    if(!this.authService.verifyCookies()) return;

    this.authService.refreshToken().subscribe({
      complete: () => {
        this.router.navigate(['']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
