import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { PreferencesService } from 'src/app/core/services/preferences.service';
import { AccesspointDetailsComponent } from 'src/app/shared/accesspoint-details/accesspoint-details.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public accessPointsObservable: Observable<Array<AccessPoint>>;
  public mapCenterLatitude: number | undefined;
  public mapCenterLongitude: number | undefined;

  private hasFullPermission: boolean;
  
  private readonly accessPointIdParamName = 'id';
  private accessPointIdParamValue: string;

  constructor(
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private authService: AuthService,
    private accessPointService: AccessPointService,
    private loggerService: LoggerService,
    private preferencesService: PreferencesService) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission);
    this.applyPreferences();

    const paramDirty = this.route.snapshot.paramMap.get(this.accessPointIdParamName);
    if (paramDirty !== null) {
      try {
        this.accessPointIdParamValue = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, paramDirty);
        this.accessPointService.getAccessPointById(this.accessPointIdParamValue, this.hasFullPermission).subscribe({
          next: (accessPoint) => this.createDetailsModalInstance([ accessPoint ]),
          error: (error) => this.loggerService.logError(error)
        });
      } catch (error) {
        this.loggerService.logError(error as Error, "Invalid page argument.");
      }
    }
  }

  /**
   * Selected AccessPoint marker event handler
   * @param e Event args
   */
  public showDetailsClick(e: any): void {
    this.createDetailsModalInstance(e as Array<AccessPoint>);
  }

  /**
   * Create a new modal with details about one or many AccessPoint entites
   * @param accessPointIds Collection of AccessPoint entity ids
   */
  private createDetailsModalInstance(accessPointIds: Array<AccessPoint>): void {
    const modalReference = this.modalService.open(AccesspointDetailsComponent, { modalDialogClass: 'modal-xl' });
    
    (modalReference.componentInstance as AccesspointDetailsComponent).accessPoints = accessPointIds;

    const changesSubscription = modalReference.componentInstance.accessPointUpdatedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission)
    }) as Subscription;

    const deleteSubscription = modalReference.componentInstance.accessPointDeletedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission)
    }) as Subscription;

    const unsubscribe = () => {
      changesSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };

    modalReference.result.then(() => unsubscribe(), () => unsubscribe());
  }

  /**
   * Apply custom user preferences
   */
  private applyPreferences(): void {
    const centerLatitude = this.preferencesService.getPreference("mapCenterLatitude");
    const centerLongitude = this.preferencesService.getPreference("mapCenterLongitude");
    
    if (centerLatitude !== null && centerLongitude !== null) {
      this.mapCenterLatitude = parseFloat(centerLatitude);
      this.mapCenterLongitude = parseFloat(centerLongitude);
    }
  }
}
