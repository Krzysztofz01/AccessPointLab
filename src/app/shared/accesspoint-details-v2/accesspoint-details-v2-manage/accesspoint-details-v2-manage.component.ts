import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccessPointAdnnotation } from 'src/app/core/models/access-point-adnnotation.model';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AccessPointDetailsV2Event } from '../accesspoint-details-v2-event.model';

@Component({
  selector: 'app-accesspoint-details-v2-manage',
  templateUrl: './accesspoint-details-v2-manage.component.html',
  styleUrls: ['./accesspoint-details-v2-manage.component.css']
})
export class AccesspointDetailsV2ManageComponent implements OnInit, OnChanges {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() accessPoint: AccessPoint;
  @Input() hasAdminPermission: boolean;
  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPointDetailsV2Event>();
  @Output() accessPointDeletedEvent = new EventEmitter<AccessPointDetailsV2Event>();

  public accessPointNoteForm: UntypedFormGroup;

  constructor(
    private accessPointService: AccessPointService,
    private loggerService: LoggerService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.accessPointNoteForm = new UntypedFormGroup({
      note: new UntypedFormControl(this.accessPoint.note)
    });
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.accessPointNoteForm !== undefined) {
      this.accessPointNoteForm.get('note').setValue(this.accessPoint.note);
    }
  }

  /**
   * Prepare the annotations data to be displayed in the table
   * @returns access point annotation entity collection
   */
  public getAdnnotations(): Array<AccessPointAdnnotation> {
    return this.accessPoint.adnnotations
      .map(adnnotations => {
        const content = (adnnotations.content.length > 60)
          ? `${adnnotations.content.substring(0, 60)}...`
          : adnnotations.content;

        return <AccessPointAdnnotation> {
          id: adnnotations.id,
          title: adnnotations.title,
          content: content,
          timestamp: adnnotations.timestamp
        }
      })
      .sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1);
  }

  /**
   * Switch the target access point entity display status
   */
   public updateAccessPointDisplayStatus(): void {
    if (!this.hasAdminPermission) {
      this.loggerService.logError('No permission to perform this operation.');
      return;
    }

    this.accessPointService.changeAccessPointDisplayStatus(this.accessPoint.id, !this.accessPoint.displayStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logError('Access point display status updated successful.');
          this.toastService.setInformation('Access point display status updated successful.');

          this.accessPointUpdatedEvent.next({
            accessPoint: this.accessPoint,
            targetViewName: 'manage',
            reloadEntity: true
          });
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point display status update failed.');
        }
      });
  }

  /**
   * Delete the target access point entity
   */
  public deleteAccessPoint(): void {
    if (!this.hasAdminPermission) {
      this.loggerService.logError('No permission to perform this operation.');
      return;
    }

    this.accessPointService.deleteAccessPoint(this.accessPoint.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('access point deleted successful.');
          this.toastService.setInformation('Access point deleted successful.');
          
          this.accessPointDeletedEvent.next({
            accessPoint: this.accessPoint,
            targetViewName: 'manage',
            reloadEntity: false
          });
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point deletion failed.');
        }
      });
  }

  /**
   * Update the note of the access point entity
   */
  public updateAccessPointNote(): void {
    if (!this.hasAdminPermission) {
      this.loggerService.logError('No permission to perform this operation.');
      return;
    }

    const note = this.accessPointNoteForm.get('note').value;
    this.accessPointService.updateAccessPoint(this.accessPoint.id, note)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('access point note updated successful.');
          this.toastService.setInformation('Access point note updated successful.');
          
          this.accessPointUpdatedEvent.next({
            accessPoint: this.accessPoint,
            targetViewName: 'manage',
            reloadEntity: true
          });
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point note update failed.');
        }
      });
  }
}
