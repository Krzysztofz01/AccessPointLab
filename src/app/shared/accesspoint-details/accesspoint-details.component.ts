import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-accesspoint-details',
  templateUrl: './accesspoint-details.component.html',
  styleUrls: ['./accesspoint-details.component.css']
})
export class AccesspointDetailsComponent implements AfterViewInit, OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public accessPointsIds: Array<string>;
  public singleAccessPoint: boolean;
  public selectedAccessPointId: string;
  public selectedAccessPoint: AccessPoint; 
  public selectedAccessPointStamp: AccessPointStamp;

  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPoint>();
  @Output() accessPointDeletedEvent = new EventEmitter<AccessPoint>();

  private map: Map

  public readonly mapId = "openlayers_accesspoints_details_map";
  private readonly featureLayerNameProp = "layer_name";
  private readonly featureLayerName = "accesspoint_layer";

  public hasAdminPermission = false;

  constructor(private modal: NgbActiveModal, private accessPointService: AccessPointService, private authService: AuthService) { }
  
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnInit(): void {
    if (this.accessPointsIds.length === 0) {
      this.modal.close(undefined);
    }

    const role = this.authService.userValue.role;
    this.hasAdminPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.singleAccessPoint = (this.accessPointsIds.length === 1);
    this.selectedAccessPointId = this.accessPointsIds[0];

    this.accessPointService.getAccessPointById(this.selectedAccessPointId, this.hasAdminPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoint) => {
          this.selectedAccessPoint = accessPoint;
          this.swapVectorLayer();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Selected AccessPoint event handler
   * @param e Event args
   */
   public selectedAccessPointChanged(e: any): void {
    this.selectedAccessPointId = e as string;
    
    this.accessPointService.getAccessPointById(this.selectedAccessPointId, this.hasAdminPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoint) => {
          this.selectedAccessPoint = accessPoint;
        },
        error: (error) => {
          console.error(error);
        }
      });

    this.swapVectorLayer();
  }

  /**
   * Select AccessPoint entity stamp event handler
   * @param e Event args
   */
  public selectedAccessPointStampChanged(e: any): void {
    throw new Error("Not implemented");
  }

  /**
   * Swap the vector layer with a new one with updated features
   */
   private swapVectorLayer(): void {
    if (this.map === undefined) return;
    
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProp) === this.featureLayerName) {
        this.map.removeLayer(layer);
      }
    });
    
    this.map.addLayer(this.generateVector());
    this.map.getView().setCenter(olProj.fromLonLat([ this.selectedAccessPoint.highSignalLongitude, this.selectedAccessPoint.highSignalLatitude ]));
  }

  /**
   * Generate a vector layer representing the information about the selected AccessPoint entity
   * @returns OpenLayers vector layer
   */
   private generateVector(): VectorLayer<VectorSource<Geometry>> {
    const circle = new Circle(olProj.fromLonLat([ this.selectedAccessPoint.highSignalLongitude, this.selectedAccessPoint.highSignalLatitude ]),
      (this.selectedAccessPoint.signalRadius < 16) ? 16 : this.selectedAccessPoint.signalRadius);

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
        zoom:17
      })
    });
  }

  /**
   * Genereate description according to the access points encryption type
   * @returns Ecryption description
   */
  public getSecurityText(): string {
    const sd: Array<string> = JSON.parse(this.selectedAccessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'WPA3 - It is the newest and safest standard available to all. It uses secure CCMP-128 / AES-256 encryption. Currently mainly used by companies and offices.';
    if(sd.includes('WPA2')) return 'WPA2 - One of the most popular standards. It uses secure CCMP / AES encryption. It is completely secure. If you have a strong password, you dont need to worry.';
    if(sd.includes('WPA')) return 'WPA - This standard uses TKIP / MIC encryption, it can be specified a bit weaker than WPA2, but still secure. Having a strong password is crucial due to dictionary attacks.';
    if(sd.includes('WPS')) return 'WPS - This standard has some vulnerabilities that allow attackers to connect to the network through a Brute-Force attack. We recommend switching to one of the WPA standards.';
    if(sd.includes('WEP')) return 'WEP - It is one of the older standards. It is vulnerable to FMS attacks due to vulnerabilities in the key generation algorithm. We recommend switching to one of the WPA standards.';
    return 'Your wifi is open. Anyone can infiltrate your network. Attackers can see your every move, they can easily intercept login details, bank details etc. You must secure your network!';
  }

  /**
   * Generate CSS color according to the access points encryption type
   * @returns CSS color variable string
   */
  public getSecurityColor(): string {
    const sd: Array<string> = JSON.parse(this.selectedAccessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'var(--apm-success)';
    if(sd.includes('WPA2')) return 'var(--apm-success)';
    if(sd.includes('WPA')) return 'var(--apm-success)';
    if(sd.includes('WPS')) return 'var(--apm-warning)';
    if(sd.includes('WEP')) return 'var(--apm-warning)';
    return 'var(--apm-danger)';
  }

  /**
   * Dismiss the current modal instance
   */
  public closeModal(): void {
    this.modal.close(undefined);
  }

}
