import { AfterContentInit, AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Circle from 'ol/geom/Circle';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { OSM, Vector as VectorSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Geometry from 'ol/geom/Geometry';
import { Subject, takeUntil } from 'rxjs';
import { AccessPointStamp } from 'src/app/core/models/access-point-stamp.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastService } from 'src/app/core/services/toast.service';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-accesspoint-details',
  templateUrl: './accesspoint-details.component.html',
  styleUrls: ['./accesspoint-details.component.css']
})
export class AccesspointDetailsComponent implements AfterViewInit, OnInit, OnDestroy, AfterContentInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public accessPoints: Array<AccessPoint>;
  public singleAccessPoint: boolean;
  
  public __selectedAccessPoint: AccessPoint;
  public __selectedAccessPointStamp: AccessPointStamp | undefined;
  public readonly _emptyStampSelection: string = "_none";

  public accessPointSelectionForm: FormGroup;
  public accessPointStampSelectionForm: FormGroup;
  public accessPointStampMergeForm: FormGroup;

  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPoint>();
  @Output() accessPointDeletedEvent = new EventEmitter<AccessPoint>();

  private map: Map

  public readonly mapId = "openlayers_accesspoints_details_map";
  private readonly featureLayerNameProp = "layer_name";
  private readonly featureLayerName = "accesspoint_layer";

  public hasAdminPermission = false;

  constructor(
    private modal: NgbActiveModal,
    private accessPointService: AccessPointService,
    private authService: AuthService,
    private toastService: ToastService,
    private loggerService: LoggerService) { }
  
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngAfterContentInit(): void {
    this.accessPointSelectionForm.get('selectedAccessPointId').setValue(this.accessPoints[0].id);
  }

  ngOnInit(): void {
    if (this.accessPoints.length === 0) {
      this.modal.close(undefined);
      return;
    }

    // Initializing default values
    this.singleAccessPoint = (this.accessPoints.length === 1);

    // Permissions
    const role = this.authService.userValue.role;
    this.hasAdminPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    // Initializing forms and form event listeners
    this.accessPointSelectionForm = new FormGroup({
      selectedAccessPointId: new FormControl(this.accessPoints[0].id)
    });
    
    this.accessPointStampSelectionForm = new FormGroup({
      selectedStampId: new FormControl(this._emptyStampSelection)
    });

    this.accessPointStampMergeForm = new FormGroup({
      mergeLowSignalLevel: new FormControl(false),
      mergeHighSignalLevel: new FormControl(false),
      mergeSsid: new FormControl(false),
      mergeSecurityData: new FormControl(false)
    });

    this.accessPointSelectionForm.get('selectedAccessPointId').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.accessPointStampSelectionForm.get('selectedStampId').setValue(this._emptyStampSelection);
        this.switchSelectedAccessPoint(id);
        this.__selectedAccessPointStamp = undefined;
      });

    this.accessPointStampSelectionForm.get('selectedStampId').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {  
        if (id !== this._emptyStampSelection) {
          this.__selectedAccessPointStamp = this.__selectedAccessPoint.stamps.find(s => s.id === id);
          this.swapVectorLayer(this.__selectedAccessPointStamp);
          return;
        }

        this.__selectedAccessPointStamp = undefined;
        this.swapVectorLayer(this.__selectedAccessPoint);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public get currentSelectedAcccessPointSnapshoot(): AccessPoint | AccessPointStamp {
    if (this.__selectedAccessPointStamp !== undefined) return this.__selectedAccessPointStamp;
    return this.__selectedAccessPoint;
  }

  /**
   * Fetch an AccessPoint entity and replace the vector layer
   * @param accessPointId Accesspoint entity id
   */
  private switchSelectedAccessPoint(accessPointId: string): void {
    this.accessPointService.getAccessPointById(accessPointId, this.hasAdminPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoint) => {
          this.__selectedAccessPoint = accessPoint;
          this.swapVectorLayer(this.__selectedAccessPoint);
        },
        error: (error) => this.loggerService.logError(error)
      });
  }

  /**
   * Swap the vector layer with a new one with updated features
   * @param accessPoint AccessPoint or AccessPointStamp entity
   * @returns 
   */
  private swapVectorLayer(accessPoint : AccessPoint | AccessPointStamp): void {
    if (this.map === undefined) {
      this.loggerService.logError('Map object is not initialized.');
      return;
    }
    
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProp) === this.featureLayerName) {
        this.map.removeLayer(layer);
      }
    });
    
    this.map.addLayer(this.generateVector(accessPoint));

    const longitude = accessPoint.highSignalLongitude;
    const latitude = accessPoint.highSignalLatitude;

    this.map.getView().setCenter(olProj.fromLonLat([ longitude, latitude ]));
  }

  /**
   * Generate a vector layer representing the information about the selected AccessPoint entity
   * @param accessPoint AccessPoint or AccessPointStamp entity
   * @returns OpenLayers vector layer
   */
  private generateVector(accessPoint : AccessPoint | AccessPointStamp): VectorLayer<VectorSource<Geometry>> {
    const longitude = accessPoint.highSignalLongitude;
    const latitude = accessPoint.highSignalLatitude;
    const radius = accessPoint.signalRadius;

    const circle = new Circle(olProj.fromLonLat([ longitude, latitude ]),
      (radius < 16) ? 16 : radius);

    const vector = new VectorLayer({
      source: new VectorSource({
        features: [ new Feature(circle) ]
      })
    });
  
    vector.set(this.featureLayerNameProp, this.featureLayerName);
    return vector;
  }

  /**
   * Initialize the map object
   */
  private initializeMap(): void {
    this.map = new Map({
      controls: [],
      target: this.mapId,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([0, 0]),
        zoom: 17
      })
    });
  }

  /**
   * Genereate description according to the access points encryption type
   * @param accessPoint AccessPoint or AccessPointStamp entity
   * @returns Encryption description
   */
  public getSecurityText(accessPoint: AccessPoint | AccessPointStamp): string {
    const sd: Array<string> = JSON.parse(accessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'WPA3 - It is the newest and safest standard available to all. It uses secure CCMP-128 / AES-256 encryption. Currently mainly used by companies and offices.';
    if(sd.includes('WPA2')) return 'WPA2 - One of the most popular standards. It uses secure CCMP / AES encryption. It is completely secure. If you have a strong password, you dont need to worry.';
    if(sd.includes('WPA')) return 'WPA - This standard uses TKIP / MIC encryption, it can be specified a bit weaker than WPA2, but still secure. Having a strong password is crucial due to dictionary attacks.';
    if(sd.includes('WPS')) return 'WPS - This standard has some vulnerabilities that allow attackers to connect to the network through a Brute-Force attack. We recommend switching to one of the WPA standards.';
    if(sd.includes('WEP')) return 'WEP - It is one of the older standards. It is vulnerable to FMS attacks due to vulnerabilities in the key generation algorithm. We recommend switching to one of the WPA standards.';
    return 'Your wifi is open. Anyone can infiltrate your network. Attackers can see your every move, they can easily intercept login details, bank details etc. You must secure your network!';
  }

  /**
   * Generate CSS color according to the access points encryption type
   * @param accessPoint AccessPoint or AccessPointStamp entity 
   * @returns CSS color variable string
   */
  public getSecurityColor(accessPoint: AccessPoint | AccessPointStamp): string {
    const sd: Array<string> = JSON.parse(accessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA2')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPS')) return 'var(--apm-encryption-medium)';
    if(sd.includes('WEP')) return 'var(--apm-encryption-medium)';
    return 'var(--apm-encryption-bad)';
  }

  /**
   * Dismiss the current modal instance
   */
  public closeModal(): void {
    this.modal.close(undefined);
  }

  /**
   * Switch the currently selected AccessPoint entity display status
   */
  public updateAccessPointDisplayStatus(): void {
    this.accessPointService.changeAccessPointDisplayStatus(this.__selectedAccessPoint.id, !this.__selectedAccessPoint.displayStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation('Access point display status updated successful.');
          this.__selectedAccessPoint.displayStatus = !this.__selectedAccessPoint.displayStatus;
          this.accessPointUpdatedEvent.next(this.__selectedAccessPoint);
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point display status update failed.');
        }
      });
  }

  /**
   * Delete the currently selected AccessPoint entity
   */
  public deleteAccessPoint(): void {
    this.accessPointService.deleteAccessPoint(this.__selectedAccessPoint.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation('Access point deleted successful.');
          if (this.singleAccessPoint) this.modal.close(undefined);

          this.accessPoints = this.accessPoints.filter(a => a.id !== this.__selectedAccessPoint.id);
          if (this.accessPoints.length === 1) this.singleAccessPoint = true;

          this.accessPointSelectionForm.get('selectedAccessPointId').setValue(this.accessPoints[0].id);  
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point deletion failed.');
        }
      });
  }

  /**
   * Delete the currently selected AccessPointStamp entity
   */
  public deleteAccessPointStamp(): void {
    this.accessPointService.deleteAccessPointStamp(this.__selectedAccessPoint.id, this.__selectedAccessPointStamp.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation('Access point stamp deleted successful.');
          this.__selectedAccessPoint.stamps = this.__selectedAccessPoint.stamps.filter(s => s.id !== this.__selectedAccessPointStamp.id);
          
          const stamp = (this.__selectedAccessPoint.stamps.length)
            ? this.__selectedAccessPoint.stamps[0].id
            : this._emptyStampSelection;

          this.accessPointStampSelectionForm.get('selectedStampId').setValue(stamp);
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point stamp deletion failed.');
        }
      });
  }

  /**
   * Merge the currently selected AccessPointStamp entity
   */
  public mergeAccessPointStamp(): void {
    this.accessPointService.mergeAccessPoints(this.__selectedAccessPoint.id, this.__selectedAccessPointStamp.id,
      this.accessPointStampMergeForm.get('mergeLowSignalLevel').value,
      this.accessPointStampMergeForm.get('mergeHighSignalLevel').value,
      this.accessPointStampMergeForm.get('mergeSsid').value,
      this.accessPointStampMergeForm.get('mergeSecurityData').value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.toastService.setInformation('Access point stamp merged successful.');
            this.accessPointSelectionForm.get('selectedAccessPointId').setValue(this.__selectedAccessPoint.id);
          },
          error: (error) => {
            this.loggerService.logError(error);
            this.toastService.setError('Access point stamp merge failed.');
          }
        });
  }
}
