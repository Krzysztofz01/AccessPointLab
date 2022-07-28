import { AfterContentInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-accesspoint-details-v2',
  templateUrl: './accesspoint-details-v2.component.html',
  styleUrls: ['./accesspoint-details-v2.component.css']
})
export class AccesspointDetailsV2Component implements OnInit, OnDestroy, AfterContentInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPoint>();
  @Output() accessPointDeletedEvent = new EventEmitter<AccessPoint>();

  public accessPointSelectionForm: UntypedFormGroup;

  public accessPoints: Array<AccessPoint>;
  public singleAccessPoint: boolean;
  public selectedAccessPoint: AccessPoint;

  public hasAdminPermission: boolean;

  private modalDataPassed = false;

  constructor(
    private modal: NgbActiveModal,
    private loggerService: LoggerService,
    private accessPointService: AccessPointService) { }

  ngOnInit(): void {
    if (!this.modalDataPassed || this.accessPoints === undefined || this.accessPoints.length === 0) {
      this.loggerService.logError('Invalid modal data state.');
      this.closeModal();
      return;
    }

    this.accessPointSelectionForm = new UntypedFormGroup({
      selectedAccessPointId: new UntypedFormControl(this.accessPoints[0].id)
    });

    this.accessPointSelectionForm.get('selectedAccessPointId').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(accessPointId => {
        this.loggerService.logInformation(`Selected access point changed to entity with id: ${accessPointId}`);
        this.switchSelectedAccessPoint(accessPointId);
      });
  }

  ngAfterContentInit(): void {
    this.accessPointSelectionForm.get('selectedAccessPointId').setValue(this.accessPoints[0].id);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Initialize modal data using modal reference
   * @param accessPoint Access point entity or collection
   * @param hasAdminPermission Boolean value indication admin or support privelages
   */
  public initializeModalData(accessPoint: AccessPoint | Array<AccessPoint>, hasAdminPermission: boolean): void {
    if (accessPoint instanceof Array<AccessPoint>) {
      this.accessPoints = accessPoint;
      this.singleAccessPoint = accessPoint.length === 1;
    } else {
      this.accessPoints = new Array<AccessPoint>(accessPoint);
      this.singleAccessPoint = true;
    }

    this.hasAdminPermission = hasAdminPermission;
    this.modalDataPassed = true;
  }

  /**
   * Fetch the access point by id from the backend server and swap the selected access point
   * @param accessPointId Accesspoint entity id
   */
   private switchSelectedAccessPoint(accessPointId: string): void {
    this.accessPointService.getAccessPointById(accessPointId, this.hasAdminPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoint) => {
          this.selectedAccessPoint = accessPoint;
        },
        error: (error) => this.loggerService.logError(error)
      });
  }

  /**
   * AccessPointUpdated event handler to use in child components
   * @param _ Discarded event object
   */
  public accessPointUpdatedEventHandler(_: Event): void {
    this.loggerService.logInformation("Raised access point update event arrived to modal root.");
    this.accessPointUpdatedEvent.next(this.selectedAccessPoint);
  }

  /**
   * AccessPointDeleted event handler to use in child components
   * @param _ Discarded event object
   */
  public accessPointDeletedEventHandler(_: Event): void {
    this.loggerService.logInformation("Raised access point delete event arrived to modal root. Closing the modal.");
    this.accessPointDeletedEvent.next(this.selectedAccessPoint);
    this.closeModal();
  }

  /**
   * Dismiss the current modal instance
   */
   public closeModal(): void {
    this.modal.close(undefined);
  }
}
