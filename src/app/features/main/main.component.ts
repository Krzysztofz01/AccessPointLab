import { ChangeDetectorRef, Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { PreferencesService } from 'src/app/core/services/preferences.service';
import { AccesspointDetailsV2Component } from 'src/app/shared/accesspoint-details-v2/accesspoint-details-v2.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public readonly mapId = 'main';

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
    private preferencesService: PreferencesService,
    private changedetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission);
    this.applyPreferences();

    const paramDirty = this.route.snapshot.queryParamMap.get(this.accessPointIdParamName);
    if (paramDirty !== null) {
      try {
        this.accessPointIdParamValue = this.sanitizer.sanitize(SecurityContext.URL, paramDirty);
        this.accessPointService.getAccessPointById(this.accessPointIdParamValue, this.hasFullPermission)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (accessPoint) => {
              this.createDetailsModalInstance([ accessPoint ]);
            },
            error: (error) => this.loggerService.logError(error)
          });
      } catch (error) {
        this.loggerService.logError(error as Error, "Invalid page argument.");
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
   * @param accessPoints Collection of AccessPoint entities
   */
  private createDetailsModalInstance(accessPoints: Array<AccessPoint>): void {
    const modalReference = this.modalService.open(AccesspointDetailsV2Component, { modalDialogClass: 'modal-xl' });

    this.changedetector.detach();

    (modalReference.componentInstance as AccesspointDetailsV2Component).initializeModalData(accessPoints, this.hasFullPermission);

    const changesSubscription = modalReference.componentInstance.accessPointUpdatedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
    }) as Subscription;

    const deleteSubscription = modalReference.componentInstance.accessPointDeletedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
    }) as Subscription;

    const releaseModalContext = () => {
      changesSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
      this.changedetector.reattach();
    };

    modalReference.result.then(() => releaseModalContext(), () => releaseModalContext());
  }

  /**
   * Apply custom user preferences
   */
  private applyPreferences(): void {
    const centerLatitude = this.preferencesService.getPreference("mapCenterLatitude") as string;
    const centerLongitude = this.preferencesService.getPreference("mapCenterLongitude") as string;
    
    if (centerLatitude !== null && centerLongitude !== null) {
      this.mapCenterLatitude = parseFloat(centerLatitude);
      this.mapCenterLongitude = parseFloat(centerLongitude);
    }
  }
}
