import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Feature, Map, View } from 'ol';
import { Circle, Geometry } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import * as olProj from 'ol/proj';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-accesspoint-details-v2-general',
  templateUrl: './accesspoint-details-v2-general.component.html',
  styleUrls: ['./accesspoint-details-v2-general.component.css']
})
export class AccesspointDetailsV2GeneralComponent implements AfterViewInit, OnChanges {
  @Input() accessPoint: AccessPoint;
  @Input() hasAdminPermission: boolean;

  private map: Map;
  public readonly mapId = "ol_ap_details_v2_map_general";

  private readonly featureLayerNameProperty = "apm_layer_name";
  private readonly featureLayerNameValue = "apm_feature_layer_general";

  constructor(
    private loggerService: LoggerService) { }

  ngAfterViewInit(): void {
    console.log(this.accessPoint);
    this.initializeMap();
    this.swapVectorLayer(this.accessPoint);
  }

  ngOnChanges(_: SimpleChanges): void {
    this.swapVectorLayer(this.accessPoint);
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
   * Swap the vector layer with a new one with updated features
   * @param accessPoint AccessPoint entity
   * @returns 
   */
  private swapVectorLayer(accessPoint : AccessPoint): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }
    
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProperty) === this.featureLayerNameValue) {
        this.map.removeLayer(layer);
      }
    });
    
    this.map.addLayer(this.generateVector(accessPoint));

    this.map.getView().setCenter(olProj.fromLonLat([
      accessPoint.highSignalLongitude,
      accessPoint.highSignalLatitude
    ]));
  }

  /**
   * Generate a vector layer representing the information about the access point entity
   * @param accessPoint Access point entity
   * @returns OpenLayers vector layer
   */
  private generateVector(accessPoint : AccessPoint): VectorLayer<VectorSource<Geometry>> {
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
  
    vector.set(this.featureLayerNameProperty, this.featureLayerNameValue);
    return vector;
  }

  /**
   * Genereate description according to the access points security standard
   * @param accessPoint Access point entity
   * @returns Encryption description
   */
  public getSecurityText(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.securityStandards);

    if(sd.includes('WPA3')) return 'WPA3 - It is the newest and safest standard available to all. It uses secure CCMP-128 / AES-256 encryption. Currently mainly used by companies and offices.';
    if(sd.includes('WPA2')) return 'WPA2 - One of the most popular standards. It uses secure CCMP / AES encryption. It is completely secure. If you have a strong password, you dont need to worry.';
    if(sd.includes('WPA')) return 'WPA - This standard uses TKIP / MIC encryption, it can be specified a bit weaker than WPA2, but still secure. Having a strong password is crucial due to dictionary attacks.';
    if(sd.includes('WPS')) return 'WPS - This standard has some vulnerabilities that allow attackers to connect to the network through a Brute-Force attack. We recommend switching to one of the WPA standards.';
    if(sd.includes('WEP')) return 'WEP - It is one of the older standards. It is vulnerable to FMS attacks due to vulnerabilities in the key generation algorithm. We recommend switching to one of the WPA standards.';
    return 'Your wifi is open. Anyone can infiltrate your network. Attackers can see your every move, they can easily intercept login details, bank details etc. You must secure your network!';
  }

  /**
   * Generate CSS color according to the access points security standard
   * @param accessPoint Access point entity 
   * @returns CSS color variable string
   */
  public getSecurityColor(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.securityStandards);

    if(sd.includes('WPA3')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA2')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPS')) return 'var(--apm-encryption-medium)';
    if(sd.includes('WEP')) return 'var(--apm-encryption-medium)';
    return 'var(--apm-encryption-bad)';
  }

  /**
   * Format array provided data
   * @param serializedArray Array of string data
   */
  public formatSerialziedArrayData(serializedArray: string): string {
    if (serializedArray === undefined) return 'None';

    const arrayData = JSON.parse(serializedArray) as Array<string>;
    if (arrayData === undefined || arrayData.length === 0) return 'None';

    return arrayData.join(', ').toUpperCase();
  }
}
