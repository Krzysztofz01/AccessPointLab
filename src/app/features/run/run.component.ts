import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject, takeUntil, zip } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';
import { mapStampToAccessPoint } from './stamp-mapper';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public readonly mapId = 'run';
  public readonly useFilters = false;
  public readonly mapHeight = 92;
  public readonly allowReloading = true;
  public readonly centerAuto = true;

  public runIdentifierForm: UntypedFormGroup;

  public runIdentifiers: Array<string>;
  public runAccessPoints: Observable<Array<AccessPoint>>;

  private hasFullPermission: boolean;

  private readonly accessPointRunIdParamName = 'runId';

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private accessPointService: AccessPointService,
    private authService: AuthService,
    private toastService: ToastService,
    private loggerService: LoggerService) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.runIdentifierForm = new UntypedFormGroup({
      selectedRunId: new UntypedFormControl(undefined)
    });

    this.runIdentifierForm.get('selectedRunId').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.handleSelectedRunIdChange());

    this.accessPointService.getRunIds(this.hasFullPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (runIdentifiers) => {
          this.runIdentifiers = runIdentifiers;

          if (this.resolvRunSelectionFromParam()) return;

          if (this.runIdentifiers.length > 0) {
            this.runIdentifierForm.get('selectedRunId').setValue(this.runIdentifiers[0])
          }
        },
        error: (error: Error) => {
          this.loggerService.logError(error);
          this.toastService.setError(error.message);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Handle the assignment of combined accesspoint data after form values change
   */
  private handleSelectedRunIdChange(): void {
    const runId = this.runIdentifierForm.get('selectedRunId').value;
    if (runId === undefined) return;

    this.runAccessPoints = this.combineRunAccessPoints(runId);
  }

  /**
   * Combine AccessPoint and AccessPointStamp entities into one observable collection
   * @param runIdentifier Unique run guid identifier 
   * @returns Observable collection of access points objects
   */
  private combineRunAccessPoints(runIdentifier: string): Observable<Array<AccessPoint>> {
    const accessPointsObservable = this.accessPointService.getAccessPointsByRunId(runIdentifier, this.hasFullPermission)
      .pipe(map((accessPoints) => {
        return accessPoints.map((accessPoint) => ({
          isStamp: false,
          ...accessPoint
        }));
      }));

    const accessPointStampsObservable = this.accessPointService.getAccessPointStampsByRunId(runIdentifier, this.hasFullPermission)
      .pipe(map((accessPointStamps) => {
        return accessPointStamps.map((accessPointStamp) => mapStampToAccessPoint(accessPointStamp));
      }));

    return zip(accessPointsObservable, accessPointStampsObservable)
      .pipe(map(c => [].concat(...c)));
  }

  /**
   * Set the currenlty selected run to selected via GET param
   * @returns Boolean value indicating if the operation was successful
   */
  private resolvRunSelectionFromParam(): boolean {
    const paramDirty = this.route.snapshot.queryParamMap.get(this.accessPointRunIdParamName);
    if (paramDirty !== null) {
      try {
        const sanitizedParamValue = this.sanitizer.sanitize(SecurityContext.URL, paramDirty);
        this.runIdentifierForm.get('selectedRunId').setValue(sanitizedParamValue);
        return true;
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.loggerService.logError(errorMessage);
        this.toastService.setError(errorMessage);
      }
    }

    return false
  }
}
