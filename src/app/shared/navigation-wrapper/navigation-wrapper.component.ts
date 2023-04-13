import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationWrapperUploadComponent } from './navigation-wrapper-upload/navigation-wrapper-upload.component';

@Component({
  selector: 'app-navigation-wrapper',
  templateUrl: './navigation-wrapper.component.html',
  styleUrls: ['./navigation-wrapper.component.css']
})
export class NavigationWrapperComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal) { }

  /**
   * Get a boolean value representing if the user is authenticated
   * @returns Boolean value representing if the user is authenticated 
   */
  public isAuthenticated(): boolean {
    if (!this.authService.userValue) return false;
    
    return true;
  }

  /**
   * Get the server name
   * @returns Server name value as string
   */
  public getServerName(): string {
    return this.authService.getServerName();
  }

  /**
   * Perform the logout via the authservice and redirect to authentication page
   */
  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  /**
   * Open a modal with all upload options
   */
  public openUploadModal(): void {
    const modalReference = this.modalService.open(NavigationWrapperUploadComponent, { modalDialogClass: 'modal-lg' });

    const releaseModalContext = () => {};

    modalReference.result.then(() => releaseModalContext(), () => releaseModalContext());
  }
}
