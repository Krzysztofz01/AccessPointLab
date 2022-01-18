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
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { environment } from 'src/environments/environment';
import { EncryptionTypes } from './encryption-types.enum';

@Component({
  selector: 'app-accesspoint-map',
  templateUrl: './accesspoint-map.component.html',
  styleUrls: ['./accesspoint-map.component.css']
})
export class AccesspointMapComponent implements OnInit, AfterViewInit {
  @Input() accessPointObservable: Observable<Array<AccessPoint>>;
  @Input() centerLatitude: number | undefined;
  @Input() centerLongitude: number | undefined;
  @Output() accessPointClick = new EventEmitter<Array<String>>(false);

  public readonly mapId = "openlayers_accesspoints_map";
  private readonly initialZoom = 16;
  private readonly initialCenterLatitude = 51;
  private readonly initialCenterLongitude = 19;
  private readonly featureAccessPointIdProp = "accesspoints_id";
  private readonly featureLayerNameProp = "layer_name";
  private readonly featureLayerName = "accesspoints_layer";

  private map: Map;
  private accessPoints: Array<AccessPoint>;

  ngAfterViewInit(): void {
    this.accessPointObservable.subscribe({
      next: (result) => {
        this.accessPoints = result;

        const features = this.generateAccessPointFeatures(this.accessPoints);
        this.initializeMap(features);
      },
      error: (error) => {
        console.log(error);
        this.accessPoints = [];
      }
    });
  }

  ngOnInit(): void {
    //TODO: Initialize filter forms
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
      const accessPointIds = new Array<String>();
      
      this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        accessPointIds.push(feature.get(this.featureAccessPointIdProp) as String);
      });

      //Emit the selected features
      const distinctIds = accessPointIds.filter((a, i) => accessPointIds.findIndex((s) => a === s) === i);
      if (distinctIds.length) this.accessPointClick.emit(distinctIds);
    });
  }

  /**
   * Swap the vector layer with features with a new vector fo features
   * @param features Collection of OpenLayers point feature representing AccessPoint entities
   */
  private swapVectorLayer(features: Array<Feature<Point>>): void {
    if (this.map === undefined) return;
    
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
   * Check if AccessPoint SSID, BSSID or manufacturer string contain a ceratin keyword
   * @param keyword Keyword used to check the AccessPoint entity
   * @param accessPoint AccessPoint entity
   * @return Boolean value representing if the AccessPoint entity is matching the requirements
   */
  private filterByKeyword(keyword: string, accessPoint: AccessPoint): boolean {
    if (keyword === undefined || keyword.trim() === '') return true;
    
    const query = (param: string) => {
      return param.trim().toLowerCase().includes(keyword.trim().toLowerCase());
    };

    return query(accessPoint.ssid) || query(accessPoint.bssid) || query(accessPoint.manufacturer);
  }

  /**
   * Check if AccessPoint uses a ceratin encryption type
   * @param type Encryption type used to check the AccessPoint entity
   * @param accessPoint AccessPoint entity
   * @return Boolean value representing if the AccessPoint entity is matching the requirements
   */
  private filterByEncryptionType(type: EncryptionTypes, accessPoint: AccessPoint): boolean {
    if (type === EncryptionTypes.All || type === undefined) return true;

    const encryptionTypes = JSON.parse(accessPoint.serializedSecurityPayload) as Array<string>;
    const selectedType = EncryptionTypes[type].toUpperCase();

    if (type !== EncryptionTypes.None) return encryptionTypes.includes(selectedType);

    const availableTypes = Object.values(EncryptionTypes).map(value => value.toString().toUpperCase());
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
    const accessPointsFeture = new Feature({
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
    if (accessPoint.ssid === environment.SSID_HIDDEN) return environment.PIN_ICON_ALTERNATIVE;
    if (accessPoint.isSecure) return environment.PIN_ICON_GOOD;
    
    const encryptionTypes = JSON.parse(accessPoint.serializedSecurityPayload) as Array<string>;
    if(encryptionTypes.includes('WEP') || encryptionTypes.includes('WPS')) return environment.PIN_ICON_AVERAGE;

    return environment.PIN_ICON_BAD;
  }
}
