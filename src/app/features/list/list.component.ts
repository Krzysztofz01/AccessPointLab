import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { PreferencesService } from 'src/app/core/services/preferences.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AccesspointDetailsV2Component } from 'src/app/shared/accesspoint-details-v2/accesspoint-details-v2.component';
import { AccesspointDetailsComponent } from 'src/app/shared/accesspoint-details/accesspoint-details.component';
import { AccessPointRangeDisplayStatusEvent } from 'src/app/shared/accesspoint-list/accesspoint-range-display-status-event.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public accessPointsObservable: Observable<Array<AccessPoint>>;
  public listPage: number | undefined = undefined;

  private useLegacyDetailsView: boolean = false;

  private hasFullPermission: boolean;
  
  private readonly listPageParamName = 'page';
  private listPageParamValue: string;
  private readonly accessPointIdParamName = 'id';
  private accessPointIdParamValue: string;

  constructor(
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private authService: AuthService,
    private accessPointService: AccessPointService,
    private toastService: ToastService,
    private loggerService: LoggerService,
    private preferencesService: PreferencesService) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission);

    const pageParamDirty = this.route.snapshot.queryParamMap.get(this.listPageParamName);
    if (pageParamDirty !== null) {
      try {
        this.listPageParamValue = this.sanitizer.sanitize(SecurityContext.URL, pageParamDirty);
        this.listPage = parseInt(this.listPageParamValue, 10);
      } catch (error) {
        this.loggerService.logError(error as Error, "Invalid page argument.");
      }
    }

    const idParamDirty = this.route.snapshot.queryParamMap.get(this.accessPointIdParamName);
    if (idParamDirty !== null) {
      try {
        this.accessPointIdParamValue = this.sanitizer.sanitize(SecurityContext.URL, idParamDirty);
        this.accessPointService.getAccessPointById(this.accessPointIdParamValue, this.hasFullPermission)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (accessPoint) => {
              this.createDetailsModalInstance(accessPoint);
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
   * Selected AccessPoint event handler
   * @param e Event args
   */
   public showDetailsClick(e: any): void {
    this.createDetailsModalInstance(e as AccessPoint);
  }

  /**
   * Create a new modal with details about the AccessPoint entity
   * @param accessPoint AccessPoint entity
   */
  private createDetailsModalInstance(accessPoint: AccessPoint): void {
    if (this.useLegacyDetailsView) {
      this.loggerService.logInformation("Using leagacy deprecated access points details view.");
      const modalReference = this.modalService.open(AccesspointDetailsComponent, { modalDialogClass: 'modal-xl' });
    
      (modalReference.componentInstance as AccesspointDetailsComponent).accessPoints = new Array<AccessPoint>(accessPoint);

      const changesSubscription = modalReference.componentInstance.accessPointUpdatedEvent.subscribe({
        complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
      }) as Subscription;

      const deleteSubscription = modalReference.componentInstance.accessPointDeletedEvent.subscribe({
        complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
      }) as Subscription;

      const unsubscribe = () => {
        changesSubscription.unsubscribe();
        deleteSubscription.unsubscribe();
      };

      modalReference.result.then(() => unsubscribe(), () => unsubscribe());
    } else {
      const modalReference = this.modalService.open(AccesspointDetailsV2Component, { modalDialogClass: 'modal-xl' });
    
      (modalReference.componentInstance as AccesspointDetailsV2Component).initializeModalData(accessPoint, this.hasFullPermission);

      const changesSubscription = modalReference.componentInstance.accessPointUpdatedEvent.subscribe({
        complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
      }) as Subscription;

      const deleteSubscription = modalReference.componentInstance.accessPointDeletedEvent.subscribe({
        complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission, false)
      }) as Subscription;

      const unsubscribe = () => {
        changesSubscription.unsubscribe();
        deleteSubscription.unsubscribe();
      };

      modalReference.result.then(() => unsubscribe(), () => unsubscribe());
    }
  }

  /**
   * Access point range deleted event handler
   * @param accessPoints Target access point entities
   */
  public deleteAccessPointRange(accessPoints: Array<AccessPoint>): void {
    if (accessPoints === undefined || accessPoints.length === 0) return;

    const targetIds = accessPoints.map((accessPoint) => {
      return accessPoint.id
    });

    this.accessPointService.deleteAccessPointRange(targetIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('Access points deleted successful.');
          this.toastService.setInformation('Access points deleted successful.');
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access points deletion failed.');
        }
      });
  }

  /**
   * Access point range display status changed event handler
   * @param displayStatusChangeEvent Event object representing the target status and target access point entity collection
   */
  public changeAccessPointRangeDisplayStatus(displayStatusChangeEvent: AccessPointRangeDisplayStatusEvent): void {
    if (displayStatusChangeEvent === undefined) return;
    
    const accessPoints = displayStatusChangeEvent.accessPoints;
    if (accessPoints === undefined || accessPoints.length === 0) return;

    const targetStatus = displayStatusChangeEvent.targetStatus;
    const targetIds = accessPoints.map((accessPoint) => {
      return accessPoint.id
    });

    this.accessPointService.changeAccessPointRangeDisplayStatus(targetIds, targetStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('Access points display status changed successful.');
          this.toastService.setInformation('Access points display status changed successful.');
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access points display status change failed.');
        }
      });
  }

  /**
   * Apply custom user preferences
   */
   private applyPreferences(): void {
    const useLegacyDetailsView = this.preferencesService.getPreference("useLegacyDetailsView");

    if (useLegacyDetailsView !== null) {
      const stringToBoolean = (value: string): boolean => {
        try {
          return JSON.parse(value);
        } catch {
          return false;
        }
      };

      this.useLegacyDetailsView = stringToBoolean(useLegacyDetailsView);
    }
  }
}
