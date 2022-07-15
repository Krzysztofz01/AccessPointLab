import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterRequest } from 'src/app/auth/contracts/register.request';
import { GlobalScopeService } from 'src/app/core/services/global-scope.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  public registerForm: UntypedFormGroup;

  constructor(
    private modal: NgbActiveModal,
    private globalScopeService: GlobalScopeService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.registerForm = new UntypedFormGroup({
      server: new UntypedFormControl('', [ Validators.required ]),
      email: new UntypedFormControl('', [ Validators.required, Validators.email ]),
      name: new UntypedFormControl('', [ Validators.required ]),
      password: new UntypedFormControl('', [ Validators.required, Validators.minLength(8) ]),
      passwordRepeat: new UntypedFormControl('', [ Validators.required, Validators.minLength(8) ])
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
      this.toastService.setError("Provided data is invalid!");
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
