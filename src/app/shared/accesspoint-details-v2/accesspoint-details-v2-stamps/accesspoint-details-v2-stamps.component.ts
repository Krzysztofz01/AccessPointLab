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
import { AccessPointDetailsV2Utilities } from '../accesspoint-details-v2.utilities';

//TODO:
//
// Verfiy local changes on update
// Implment handling for the event emitter
// Check behavour for multiple and no stamps
// Update circle colors
// Add comments


@Component({
  selector: 'app-accesspoint-details-v2-stamps',
  templateUrl: './accesspoint-details-v2-stamps.component.html',
  styleUrls: ['./accesspoint-details-v2-stamps.component.css']
})
export class AccesspointDetailsV2StampsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  @Input() accessPoint: AccessPoint;
  @Input() hasAdminPermission: boolean;

  @Output() accessPointUpdatedEvent = new EventEmitter<AccessPoint>();

  public accessPointStampSelectionForm: UntypedFormGroup;
  public accessPointStampsMergeOptionsForm: UntypedFormGroup;

  public selectedAccessPointStamp: AccessPointStamp;

  private map: Map;
  public readonly mapId = "ol_ap_details_v2_map_stamps";

  private readonly baseCircleFeatureLayerNameProperty = "apm_base_layer_name";
  private readonly baseCircleFeatureLayerNameValue = "apm_feature_base_layer_stamps";
  private readonly stampCircleFeatureLayerNameProperty = "apm_stamp_layer_name";
  private readonly stampCircleFeatureLayerNameValue = "apm_feature_stamp_layer_stamps"

  private readonly baseCircleColor = { r: 0, g: 0, b: 0 };
  private readonly stampCircleColor = { r: 0, g: 0, b: 0 };

  constructor(
    private loggerService: LoggerService,
    private toastService: ToastService,
    private accessPointService: AccessPointService) { }

  ngOnInit(): void {
    this.accessPointStampSelectionForm = new UntypedFormGroup({
      selectedStampId: new UntypedFormControl()
    });

    this.accessPointStampsMergeOptionsForm = new UntypedFormGroup({
      mergeLowSignalLevel: new UntypedFormControl(false),
      mergeHighSignalLevel: new UntypedFormControl(false),
      mergeSsid: new UntypedFormControl(false),
      mergeSecurityData: new UntypedFormControl(false)
    })

    this.accessPointStampSelectionForm.get('selectedStampId').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(accessPointStampId => {
        this.loggerService.logInformation(`Selected access point stamp changed to entity with id: ${accessPointStampId}`);
        this.switchSelectedAccessPointStamp(accessPointStampId);
      });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.swapBaseVectorLayer(this.accessPoint);
  }
  
  ngOnChanges(_: SimpleChanges): void {
    if (this.map !== undefined)
      this.swapBaseVectorLayer(this.accessPoint);

    if (this.accessPointStampSelectionForm !== undefined)
      this.accessPointStampSelectionForm.reset();

    if (this.accessPointStampsMergeOptionsForm !== undefined)
      this.accessPointStampsMergeOptionsForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Initialize the map object. Method is using the utility class
   */
  private initializeMap(): void {
    this.map = AccessPointDetailsV2Utilities
      .createOpenLayersMap(this.mapId, 18);
  }

  private switchSelectedAccessPointStamp(accessPointStampId: string): void {
    if (accessPointStampId === undefined) {
      this.loggerService.logError("Invalid stampd id provided.");
      return;
    }
    
    const targetStamp = this.accessPoint.stamps.find(stamp =>
      stamp.id == accessPointStampId);

    if (targetStamp === undefined) {
      this.loggerService.logError("Invalid stamp id result.");
      return;
    }

    this.selectedAccessPointStamp = targetStamp;
    this.swapStampVectorLayer(this.selectedAccessPointStamp);
  }


  private swapBaseVectorLayer(accessPoint: AccessPoint): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }

    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.baseCircleFeatureLayerNameProperty) === this.baseCircleFeatureLayerNameValue) {
        this.map.removeLayer(layer);
      }
    });

    this.map.addLayer(this.generateBaseVector(accessPoint));

    this.map.getView().setCenter(olProj.fromLonLat([
      accessPoint.highSignalLongitude,
      accessPoint.highSignalLatitude
    ]));
  }

  private generateBaseVector(accessPoint: AccessPoint): VectorLayer<VectorSource<Geometry>> {
    const circle = AccessPointDetailsV2Utilities
      .getOpenLayersAccessPointRadiusCircle(accessPoint);

    const fillColor = `rgba(${this.baseCircleColor.r}, ${this.baseCircleColor.g}, ${this.baseCircleColor.b}, 0.3)`
    const strokeColor = `rgba(${this.baseCircleColor.r}, ${this.baseCircleColor.g}, ${this.baseCircleColor.b}, 1)`

    const vector = new VectorLayer({
      source: new VectorSource({
        features: [ new Feature(circle) ]
      }),
      style: new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor })
      })
    });
  
    vector.set(this.baseCircleFeatureLayerNameProperty, this.baseCircleFeatureLayerNameValue);
    return vector;
  }

  
  private swapStampVectorLayer(accessPointStamp: AccessPointStamp): void {
    if (this.map === undefined) {
      this.loggerService.logError('The map object is not initialized.');
      return;
    }

    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(this.stampCircleFeatureLayerNameProperty) === this.stampCircleFeatureLayerNameValue) {
        this.map.removeLayer(layer);
      }
    });

    this.map.addLayer(this.generateStampVector(accessPointStamp));

    this.map.getView().setCenter(olProj.fromLonLat([
      accessPointStamp.highSignalLongitude,
      accessPointStamp.highSignalLatitude
    ]));
  }

  private generateStampVector(accessPointStamp: AccessPointStamp): VectorLayer<VectorSource<Geometry>> {
    const circle = AccessPointDetailsV2Utilities
      .getOpenLayersAccessPointRadiusCircle(accessPointStamp);

    const fillColor = `rgba(${this.stampCircleColor.r}, ${this.stampCircleColor.g}, ${this.stampCircleColor.b}, 0.3)`
    const strokeColor = `rgba(${this.stampCircleColor.r}, ${this.stampCircleColor.g}, ${this.stampCircleColor.b}, 1)`

    const vector = new VectorLayer({
      source: new VectorSource({
        features: [ new Feature(circle) ]
      }),
      style: new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor })
      })
    });
  
    vector.set(this.stampCircleFeatureLayerNameProperty, this.stampCircleFeatureLayerNameValue);
    return vector;
  }

  /**
   * Merge the currently selected AccessPointStamp entity
   */
  public mergeAccessPointStamp(): void {
    this.accessPointService.mergeAccessPoints(this.accessPoint.id, this.selectedAccessPointStamp.id,
      this.accessPointStampsMergeOptionsForm.get('mergeLowSignalLevel').value,
      this.accessPointStampsMergeOptionsForm.get('mergeHighSignalLevel').value,
      this.accessPointStampsMergeOptionsForm.get('mergeSsid').value,
      this.accessPointStampsMergeOptionsForm.get('mergeSecurityData').value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.loggerService.logInformation('Access point stamp merged successful.');
            this.toastService.setInformation('Access point stamp merged successful.');
            
            //TODO: Verify if is working
            this.accessPoint.stamps.find(stamp => stamp.id === this.selectedAccessPointStamp.id).status = true;
            this.accessPointStampSelectionForm.get('selectedAccessPointId').setValue(this.selectedAccessPointStamp.id);
            
            this.accessPointUpdatedEvent.next(this.accessPoint);
          },
          error: (error) => {
            this.loggerService.logError(error);
            this.toastService.setError('Access point stamp merge failed.');
          }
        });
      }

  /**
   * Delete the currently selected AccessPointStamp entity
   */
  public deleteAccessPointStamp(): void {
    this.accessPointService.deleteAccessPointStamp(this.accessPoint.id, this.selectedAccessPointStamp.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.loggerService.logInformation('Access point stamp deleted successful.');
          this.toastService.setInformation('Access point stamp deleted successful.');
          
          this.accessPoint.stamps = this.accessPoint.stamps.filter(stamp => stamp.id !== this.selectedAccessPointStamp.id);
          
          this.setFirstStampSelected();
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError('Access point stamp deletion failed.');
        }
      });
  }



  private setFirstStampSelected(): void {
    if (this.accessPointStampSelectionForm === undefined) return;
    if (this.accessPoint.stamps.length === 0) return;

    const firstStampId = (this.accessPoint.stamps.length > 0)
      ? this.accessPoint.stamps[0].id
      : undefined;

    this.accessPointStampSelectionForm.get('selectedStampId').setValue(firstStampId);
  }


}
