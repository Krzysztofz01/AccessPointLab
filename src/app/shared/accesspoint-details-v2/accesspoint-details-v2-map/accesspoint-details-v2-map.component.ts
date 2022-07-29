import { Feature, Map } from 'ol';
import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointDetailsV2Utilities } from '../accesspoint-details-v2.utilities';
import { LoggerService } from 'src/app/core/services/logger.service';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import * as olProj from 'ol/proj';
import { Geometry } from 'ol/geom';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

@Component({
  selector: 'app-accesspoint-details-v2-map',
  templateUrl: './accesspoint-details-v2-map.component.html',
  styleUrls: ['./accesspoint-details-v2-map.component.css']
})
export class AccesspointDetailsV2MapComponent implements AfterViewInit, OnChanges {
  @Input() accessPoint: AccessPoint;

  private map: Map;
  public readonly mapId = "ol_ap_details_v2_map_map";

  private readonly featureLayerNameProperty = "apm_layer_name";
  private readonly featureLayerNameValue = "apm_feature_layer_map";

  constructor(
    private loggerService: LoggerService) { }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.swapVectorLayer(this.accessPoint);
  }

  ngOnChanges(_: SimpleChanges): void {
    this.swapVectorLayer(this.accessPoint);
  }

  /**
   * Initialize the map object. Method is using the utility class
   */
  private initializeMap(): void {
    this.map = AccessPointDetailsV2Utilities
      .createOpenLayersMap(this.mapId, 17);
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
    const circle = AccessPointDetailsV2Utilities
      .getOpenLayersAccessPointRadiusCircle(accessPoint);

    const fillColor = AccessPointDetailsV2Utilities
      .getOpenLayersColorBySecurityStandard(accessPoint, 0.3);

    const strokeColor = AccessPointDetailsV2Utilities
    .getOpenLayersColorBySecurityStandard(accessPoint, 1);

    const vector = new VectorLayer({
      source: new VectorSource({
        features: [ new Feature(circle) ]
      }),
      style: new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor })
      })
    });
  
    vector.set(this.featureLayerNameProperty, this.featureLayerNameValue);
    return vector;
  }
}
