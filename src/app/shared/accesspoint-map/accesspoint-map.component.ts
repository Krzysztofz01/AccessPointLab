import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { OSM, Vector as VectorSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { environment } from 'src/environments/environment';
import { EncryptionTypes } from './encryption-types.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-accesspoint-map',
  templateUrl: './accesspoint-map.component.html',
  styleUrls: ['./accesspoint-map.component.css']
})
export class AccesspointMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() accessPointObservable: Observable<Array<AccessPoint>>;
  @Input() centerLatitude: number | undefined;
  @Input() centerLongitude: number | undefined;
  @Output() accessPointClick = new EventEmitter<Array<AccessPoint>>(false);

  public keywordFilterForm: FormGroup;
  public encryptionTypeFilterForm: FormGroup;

  public readonly mapId = "openlayers_accesspoints_map";
  private readonly initialZoom = 16;
  private readonly initialCenterLatitude = 51;
  private readonly initialCenterLongitude = 19;
  private readonly featureAccessPointIdProp = "accesspoints_id";
  private readonly featureLayerNameProp = "layer_name";
  private readonly featureLayerName = "accesspoints_layer";
  
  public readonly encryptionTypesArray = Object.values(EncryptionTypes).filter(value => typeof value === 'string') as Array<String>;
  public readonly defaultSelectedEncryptionType = EncryptionTypes[EncryptionTypes.All];

  private map: Map;
  private accessPoints: Array<AccessPoint>;

  constructor(private loggerService: LoggerService) { }

  ngAfterViewInit(): void {
    this.accessPointObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.accessPoints = result;

          const features = this.generateAccessPointFeatures(this.accessPoints);
          this.initializeMap(features);
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.accessPoints = [];
        }
      });
  }

  ngOnInit(): void {
    this.encryptionTypeFilterForm = new FormGroup({
      selectedEncryption: new FormControl(this.defaultSelectedEncryptionType)
    });

    this.keywordFilterForm = new FormGroup({
      keyword: new FormControl()
    });

    this.encryptionTypeFilterForm.get('selectedEncryption').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const type = EncryptionTypes[this.keywordFilterForm.get('keyword').value];
        const features = this.generateAccessPointFeatures(this.accessPoints, type, value);
        this.swapVectorLayer(features);
      });

    this.keywordFilterForm.get('keyword').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const features = this.generateAccessPointFeatures(this.accessPoints, value, this.encryptionTypeFilterForm.get('selectedEncryption').value);
        this.swapVectorLayer(features);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Initialize the map object with vector features layer and setup the click event listener
   * @param features Collection of OpenLayers point feature representing AccessPoint entities
   */
  private initializeMap(features: Array<Feature<Point>>): void {
    const vector = new VectorLayer({
      source: new VectorSource({ features })
    });

    vector.set(this.featureLayerNameProp, this.featureLayerName);

    // Map initialization
    this.map = new Map({
      controls: [],
      target: this.mapId,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vector
      ],
      view: new View({
        center: olProj.fromLonLat((this.centerLatitude === undefined || this.centerLongitude === undefined) ? [ this.initialCenterLongitude, this.initialCenterLatitude ] : [ this.centerLongitude, this.centerLatitude ]),
        zoom: this.initialZoom
      })
    });

    // Marker click event
    this.map.on('click', (e) => {
      const accessPoints = new Array<AccessPoint>();
      
      this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        accessPoints.push(this.accessPoints.find(a => a.id == feature.get(this.featureAccessPointIdProp) as string));
      });

      //Emit the selected features
      const disctinctAccessPoints = Array.from(new Set(accessPoints.map(a => a.id))).map(id => {
        return accessPoints.find(a => a.id == id);
      });

      if (disctinctAccessPoints.length) this.accessPointClick.emit(disctinctAccessPoints);
    });
  }

  /**
   * Swap the vector layer with features with a new vector fo features
   * @param features Collection of OpenLayers point feature representing AccessPoint entities
   */
  private swapVectorLayer(features: Array<Feature<Point>>): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }
    
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProp) === this.featureLayerName) {
        this.map.removeLayer(layer);
      }
    });

    const vector = new VectorLayer({
      source: new VectorSource({ features })
    });

    vector.set(this.featureLayerNameProp, this.featureLayerName);
    this.map.addLayer(vector);
  }

  /**
   * Check if AccessPoint SSID, BSSID string contain a ceratin keyword
   * @param keyword Keyword used to check the AccessPoint entity
   * @param accessPoint AccessPoint entity
   * @return Boolean value representing if the AccessPoint entity is matching the requirements
   */
  private filterByKeyword(keyword: string, accessPoint: AccessPoint): boolean {
    if (keyword === undefined || keyword.trim() === '') return true;
    
    const query = (param: string) => {
      return param.trim().toLowerCase().includes(keyword.trim().toLowerCase());
    };

    return query(accessPoint.ssid) || query(accessPoint.bssid);
  }

  /**
   * Check if AccessPoint uses a ceratin encryption type
   * @param type Encryption type used to check the AccessPoint entity
   * @param accessPoint AccessPoint entity
   * @return Boolean value representing if the AccessPoint entity is matching the requirements
   */
  private filterByEncryptionType(type: EncryptionTypes, accessPoint: AccessPoint): boolean {
    if (Number(EncryptionTypes[type]) === Number(EncryptionTypes.All) || type === undefined) return true;

    const encryptionTypes = JSON.parse(accessPoint.serializedSecurityPayload) as Array<string>;
    const selectedType = type.toString().toUpperCase();

    if (Number(EncryptionTypes[type]) !== Number(EncryptionTypes.None)) return encryptionTypes.includes(selectedType);

    const availableTypes = this.encryptionTypesArray.map(value => value.toUpperCase());
    return !encryptionTypes.some(type => availableTypes.includes(type));
  }

  /**
   * Map a AccessPoint entity collection to OpenLayers point feature collection
   * @param accessPoints AccessPoint entity collection
   * @param filterKeyword Filter keyword
   * @param filterType Filter encryption type
   * @returns Collection of OpenLayers point features representing AccessPoint entities
   */
  private generateAccessPointFeatures(accessPoints: Array<AccessPoint>, filterKeyword: string = undefined, filterType: EncryptionTypes = undefined): Array<Feature<Point>> {
    const features = new Array<Feature<Point>>();

    accessPoints.forEach(ap => {
      if (!this.filterByKeyword(filterKeyword, ap) || !this.filterByEncryptionType(filterType, ap)) return;

      features.push(this.generateAccessPointFeature(ap));
    });

    return features;
  }

  /**
   * Create a OpenLayers features representing a AccessPoint entity
   * @param accessPoint AccessPoint entity
   * @returns Openlayers point feature with the pin icon and metadata
   */
  private generateAccessPointFeature(accessPoint: AccessPoint): Feature<Point> {
    const accessPointsFeture = new Feature<Point>({
      geometry: new Point(olProj.fromLonLat([ accessPoint.highSignalLongitude, accessPoint.highSignalLatitude ]))
    });
    
    const accessPointFeatureStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: this.getPinIcon(accessPoint)
      })
    });

    accessPointsFeture.setStyle(accessPointFeatureStyle);
    accessPointsFeture.set(this.featureAccessPointIdProp, accessPoint.id);
    return accessPointsFeture;
  }

  /**
   * Get a pin url with the color defined by the encryption type
   * @param accessPoint AccessPoint entity
   * @returns Pin icon url as string
   */
  private getPinIcon(accessPoint: AccessPoint): string {
    const setPath = (assetName: string): string => {
      return `/assets/${assetName}`;
    };

    if (accessPoint.ssid === environment.SSID_HIDDEN) return setPath(environment.PIN_ICON_UNKNOWN);

    const encryptionTypes = (JSON.parse(accessPoint.serializedSecurityPayload) as Array<string>).map(type => type.toUpperCase());

    if(encryptionTypes.includes('WPA3')) return setPath(environment.PIN_ICON_WPA3);
    if(encryptionTypes.includes('WPA2')) return setPath(environment.PIN_ICON_WPA2);
    if(encryptionTypes.includes('WPA')) return setPath(environment.PIN_ICON_WPA);
    if(encryptionTypes.includes('WPS')) return setPath(environment.PIN_ICON_WPS);
    if(encryptionTypes.includes('WEP')) return setPath(environment.PIN_ICON_WEP);

    return setPath(environment.PIN_ICON_NONE);
  }
}
