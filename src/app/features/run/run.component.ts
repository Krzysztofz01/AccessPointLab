import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { map, Observable, Subject, takeUntil, zip } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public readonly mapId = 'run';
  public readonly useFilters = false;

  public runIdentifierForm: UntypedFormGroup;

  public runIdentifiers: Array<string>;
  public runAccessPoints: Observable<Array<AccessPoint>>;

  private hasFullPermission: boolean;

  constructor(
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

  public showDetailsClick($event: Array<AccessPoint>): void {
    // TODO: Implementation
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
        accessPoints.map((accessPoint) => ({
          isStamp: false,
          ...accessPoint
        }))
      }));
    
    const stampsObservable = this.accessPointService.getAccessPointStampsByRunId(runIdentifier, this.hasFullPermission)
      .pipe(map((stamps) => {
        stamps.map((stamp) => ({
          id: stamp.id,
          bssid: undefined,
          manufacturer: undefined,
          ssid: stamp.ssid,
          frequency: stamp.frequency,
          deviceType: stamp.deviceType,
          contributorId: stamp.contributorId,
          creationTimestamp: stamp.creationTimestamp,
          versionTimestamp: undefined,
          lowSignalLevel: stamp.lowSignalLevel,
          lowSignalLatitude: stamp.lowSignalLatitude,
          lowSignalLongitude: stamp.lowSignalLongitude,
          highSignalLevel: stamp.highSignalLevel,
          highSignalLatitude: stamp.highSignalLatitude,
          highSignalLongitude: stamp.highSignalLongitude,
          signalRadius: stamp.signalRadius,
          signalArea: stamp.signalArea,
          rawSecurityPayload: stamp.rawSecurityPayload,
          securityStandards: stamp.securityStandards,
          securityProtocols: stamp.securityProtocols,
          isSecure: stamp.isSecure,
          isPresent: stamp.isPresent,
          runIdentifier: stamp.runIdentifier,
          note: undefined,
          displayStatus: undefined,
          stamps: undefined,
          adnnotations: undefined,
          isStamp: true,
        } as AccessPoint))
      }));

      return zip(accessPointsObservable, stampsObservable)
        .pipe(map(c => [].concat(...c)));
  }
}
