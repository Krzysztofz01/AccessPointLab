import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterRequest } from 'src/app/auth/contracts/register.request';
import { GlobalScopeService } from 'src/app/core/services/global-scope.service';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  public registerForm: FormGroup;

  public notificationShow: boolean;
  public notificationText: string;
  public notificationType: string = 'danger';

  constructor(private modal: NgbActiveModal, private globalScopeService: GlobalScopeService) { }

  ngOnInit(): void {
    this.notificationShow = false;

    this.registerForm = new FormGroup({
      server: new FormControl('', [ Validators.required ]),
      email: new FormControl('', [ Validators.required, Validators.email ]),
      name: new FormControl('', [ Validators.required ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
      passwordRepeat: new FormControl('', [ Validators.required, Validators.minLength(8) ])
    });
  }

  /**
  * Compare if given passwords are matching
  * @returns Boolean value indicating if passwords in form are matching
  */
  private comparePassword(): boolean {
    return this.registerForm.get('password').value == this.registerForm.get('passwordRepeat').value;
  }

  /**
  * Validate and pass form to parent. Method is triggered on submit button click
  */
  public submit(): void {
    if(!this.registerForm.valid || !this.comparePassword()) {
      this.notificationShow = true;
      this.notificationText = 'Provided data invalid!';
      return;
    }

    this.globalScopeService.setServer(this.registerForm.get('server').value);

    const registerData: RegisterRequest = {
      email: this.registerForm.get('email').value,
      name: this.registerForm.get('name').value,
      password: this.registerForm.get('password').value,
      passwordRepeat: this.registerForm.get('passwordRepeat').value
    }

    this.modal.close(registerData);
  }
}
