import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Feature, Map } from 'ol';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { Subject, takeUntil } from 'rxjs';
import { AccessPointStamp } from 'src/app/core/models/access-point-stamp.model';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AccessPointDetailsV2Event } from '../accesspoint-details-v2-event.model';
import { AccessPointDetailsV2Utilities } from '../accesspoint-details-v2.utilities';
import { MergeOptions } from './merge-options.model';

@Component({
  selector: 'app-accesspoint-details-v2-stamps',
  templateUrl: './accesspoint-details-v2-stamps.component.html',
  styleUrls: ['./accesspoint-details-v2-stamps.component.css']
})
export class AccesspointDetailsV2StampsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  @Input() accessPoint: AccessPoint;
  @Input() hasAdminPermission: boolean;
  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPointDetailsV2Event>();

  public accessPointStampsMergeOptionsForm: UntypedFormGroup;

  private map: Map;
  public readonly mapId = "ol_ap_details_v2_map_stamps";

  private readonly featureLayerNameProperty = "apm_layer_name";
  private readonly baseFeatureLayerNameValue = "apm_feature_layer_stamps_base";
  private readonly stampFeatureLayerNameValue = "apm_feature_layer_stamps_stamp";

  private readonly baseCircleColor = { r: 95, g: 10, b: 135 };
  private readonly stampCircleColor = { r: 164, g: 80, b: 139 };

  constructor(
    private loggerService: LoggerService,
    private toastService: ToastService,
    private accessPointService: AccessPointService) { }

  ngOnInit(): void {
    this.accessPointStampsMergeOptionsForm = new UntypedFormGroup({
      mergeLowSignalLevel: new UntypedFormControl(false),
      mergeHighSignalLevel: new UntypedFormControl(false),
      mergeSsid: new UntypedFormControl(false),
      mergeSecurityData: new UntypedFormControl(false)
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.swapVectorLayer(this.accessPoint, this.baseFeatureLayerNameValue);
  }
  
  ngOnChanges(_: SimpleChanges): void {
    if (this.map !== undefined) {
      this.removeCustomVectorLayers();
      this.swapVectorLayer(this.accessPoint, this.baseFeatureLayerNameValue);
    }
  }

  ngOnDestroy(): void {
    this.removeCustomVectorLayers();
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Initialize the map object. Method is using the utility class
   */
  private initializeMap(): void {
    this.map = AccessPointDetailsV2Utilities
      .createOpenLayersMap(this.mapId, 18, this.featureLayerNameProperty);
  }

  /**
   * Swap the OpenLayers vector layers containing the access point circles
   * @param accessPoint AccessPoint or AccessPointStamp entity
   * @param layerName Target layer name
   */
  private swapVectorLayer(accessPoint: AccessPoint | AccessPointStamp, layerName: string): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }

    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProperty) === layerName) {
        this.map.removeLayer(layer);
      }
    });

    this.map.addLayer(this.generateVector(accessPoint, layerName));

    this.map.getView().setCenter(olProj.fromLonLat([
      accessPoint.highSignalLongitude,
      accessPoint.highSignalLatitude
    ]));
  }

  /**
   * Generate a OpenLayres vector layer containing the access point circles 
   * @param accessPoint AccessPoint or AccessPointStamp entity
   * @param layerName Target layer name 
   * @returns OpenLayers vector layer
   */
  private generateVector(accessPoint: AccessPoint | AccessPointStamp, layerName: string): VectorLayer<VectorSource<Geometry>> {
    const circle = AccessPointDetailsV2Utilities
      .getOpenLayersAccessPointRadiusCircle(accessPoint);

    const color = (AccessPointDetailsV2Utilities.isAccessPointInstance(accessPoint))
      ? this.baseCircleColor : this.stampCircleColor;

    const fillColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`
    const strokeColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`

    const vector = new VectorLayer({
      source: new VectorSource({
        features: [ new Feature(circle) ]
      }),
      style: new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor })
      })
    });
  
    vector.set(this.featureLayerNameProperty, layerName);
    return vector;
  }

  /**
   * Remove all custom added vector layers from the map object
   */
  private removeCustomVectorLayers(): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }

    this.map.getAllLayers().forEach(layer => {
      if (layer && layer.get(this.featureLayerNameProperty) !== this.mapId)
        this.map.removeLayer(layer);
    });
  }

  /**
   * Switch the currently displayed stamp on map
   * @param accessPointStamp AccessPointStamp entity
   */
  public previewAccessPointStamp(accessPointStamp: AccessPointStamp): void {
    this.swapVectorLayer(accessPointStamp, this.stampFeatureLayerNameValue);
  }

  /**
   * Send a request to the AccessPointMap backend to merge a certain stamp
   * @param accessPointStamp Target AccessPointStamp entity
   */
  public mergeAccessPointStamp(accessPointStamp: AccessPointStamp): void {
    const mergeOptions = this.getMergeOptions();

    this.accessPointService.mergeAccessPoints(this.accessPoint.id, accessPointStamp.id,
      mergeOptions.mergeLowSignalLevel,
      mergeOptions.mergeHighSignalLevel,
      mergeOptions.mergeSsid,
      mergeOptions.mergeSecurityData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.loggerService.logInformation('Access point stamp merged successful.');
            this.toastService.setInformation('Access point stamp merged successful.');

            this.accessPointUpdatedEvent.next({
              accessPoint: this.accessPoint,
              targetViewName: 'stamps',
              reloadEntity: true});
          },
          error: (error) => {
            this.loggerService.logError(error);
            this.toastService.setError('Access point stamp merge failed.');
          }
        });
  }

  /**
   * Send a request to the AccessPointMap backend to delete a certain stamp
   * @param accessPointStamp Target AccessPointStamp entity
   */
  public deleteAccessPointStamp(accessPointStamp: AccessPointStamp): void {
    this.accessPointService.deleteAccessPointStamp(this.accessPoint.id, accessPointStamp.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('Access point stamp deleted successful.');
          this.toastService.setInformation('Access point stamp deleted successful.');

          this.accessPointUpdatedEvent.next({
            accessPoint: this.accessPoint,
            targetViewName: 'stamps',
            reloadEntity: true});
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point stamp deletion failed.');
        }
      });
  }

  /**
   * Get the merge settings from the form
   * @returns Merge options object
   */
  private getMergeOptions(): MergeOptions {
    return {
      mergeLowSignalLevel: this.accessPointStampsMergeOptionsForm.get('mergeLowSignalLevel').value,
      mergeHighSignalLevel: this.accessPointStampsMergeOptionsForm.get('mergeHighSignalLevel').value,
      mergeSsid: this.accessPointStampsMergeOptionsForm.get('mergeSsid').value,
      mergeSecurityData: this.accessPointStampsMergeOptionsForm.get('mergeSecurityData').value
    }
  }

  /**
   * Format the date. Method is using the utility class
   * @param date 
   */
   public formatDate(date: Date): string {
    return AccessPointDetailsV2Utilities.formatDate(date);
  }
}
