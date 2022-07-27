import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { AccesspointDetailsComponent } from 'src/app/shared/accesspoint-details/accesspoint-details.component';
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
    private loggerService: LoggerService) { }

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
              console.log(accessPoint);
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
  }
}
