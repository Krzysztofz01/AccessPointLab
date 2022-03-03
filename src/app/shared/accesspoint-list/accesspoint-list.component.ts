import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { LoggerService } from 'src/app/core/services/logger.service';

@Component({
  selector: 'app-accesspoint-list',
  templateUrl: './accesspoint-list.component.html',
  styleUrls: ['./accesspoint-list.component.css']
})
export class AccesspointListComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() accessPointObservable: Observable<Array<AccessPoint>>;
  @Input() page: number | undefined;
  @Output() accessPointClick = new EventEmitter<AccessPoint>(false);

  public readonly pageSize = 18; 

  private accessPoints: Array<AccessPoint>;

  public enrichedAccessPoints: Array<AccessPoint>;
  public searchKeyword: string = '';
  public lastSearchKeyword: string = '';
  public key: string = 'id';
  public reverse: boolean = false;

  constructor(private loggerService: LoggerService) { }

  ngOnInit(): void {
    this.enrichedAccessPoints = new Array<AccessPoint>();
    if (this.page === undefined) this.page = 1;

    this.initializeAccessPoints();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Fetch AccessPoints entities and prepare aditional data
   */
  private initializeAccessPoints(): void {
    this.accessPointObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoints) => {
          this.accessPoints = accessPoints;
          this.applyFiltersToAccessPoint(this.accessPoints);
        },
        error: (error) => this.loggerService.logError(error)
      });
  }

  /**
   * Filter out AccessPoints and prepare aditional data
   * @param accessPoints AccessPoint entity collection
   */
  private applyFiltersToAccessPoint(accessPoints: Array<AccessPoint>): void {
    this.enrichedAccessPoints = this.filterAccessPointByKeyword(accessPoints).map((accessPoint) => ({
      parsedId: this.parseId(accessPoint),
      parsedColorValue: this.parseSecurityColor(accessPoint),
      parsedEncryptionType: this.parseSecurityName(accessPoint),
      parsedManufacturer: this.parseManufacturer(accessPoint),
      ...accessPoint
    }));
  }

  /**
   * Apply the keyword filters to a collection of AccessPoint entities
   * @param accessPoints Collection of AccessPoint Entities
   * @returns Collection of AccessPoint Entities
   */
  public filterAccessPointByKeyword(accessPoints: Array<AccessPoint>): Array<AccessPoint> {
    const cKw = this.searchKeyword.trim().toLocaleLowerCase();
    const query = (param: string) => {
      return (param !== undefined) ? param.trim().toLocaleLowerCase().match(cKw) : ''.match(cKw);
    }

    return accessPoints.filter(ap => {
      return query(ap.ssid) || query(ap.bssid) || query(ap.manufacturer) || query(ap.serializedSecurityPayload) || query(ap.deviceType);
    });
  }

  /**
   * Reinitialize AccessPoint entity collection with keyword. Method used by the ng2-search-filter dependency
   */
  public searchAccessPoints(): void {
    this.applyFiltersToAccessPoint(this.accessPoints);
  }

  /**
   * Sort method used by the ngx-order-pipe dependency
   * @param sortyKey Sort parameter
   */
  public sortAccessPoints(sortyKey: string): void {
    this.key = sortyKey;
    this.reverse = !this.reverse;
  }

  /**
   * Invoke the event emitter in order to open the details modal in parent component
   * @param accessPoint AccessPoint entity
   */
  public accessPointShowDetails(accessPoint: AccessPoint): void {
    this.accessPointClick.emit(accessPoint);
  }

  /**
   * Generate a CSS color value based on the encryption type
   * @param accessPoint AccessPoint entity
   * @returns CSS color param
   */
  private parseSecurityColor(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA2')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPS')) return 'var(--apm-encryption-medium)';
    if(sd.includes('WEP')) return 'var(--apm-encryption-medium)';
    return 'var(--apm-encryption-bad)';
  }

  /**
   * Generate a simplified encryption information
   * @param accessPoint AccessPoint entity
   * @returns Simplified encryption information 
   */
  private parseSecurityName(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.serializedSecurityPayload);

    if(sd.includes('WPA3')) return 'WPA3';
    if(sd.includes('WPA2')) return 'WPA2';
    if(sd.includes('WPA')) return 'WPA';
    if(sd.includes('WPS')) return 'WPS';
    if(sd.includes('WEP')) return 'WEP';
    return 'None';
  }

  /**
   * Generate a universal representation of the AccessPoints manufacturer
   * @param accessPoint AccessPoint entity
   * @returns Manufacturer name
   */
  private parseManufacturer(accessPoint: AccessPoint): string {
    return (accessPoint.manufacturer === undefined || accessPoint.manufacturer === '') ? 'Unknown' : accessPoint.manufacturer;
  }

  /**
   * Generate a shorter version of the identifier
   * @param accessPoint AccessPoint entity
   */
  private parseId(accessPoint: AccessPoint): string {
    return `${accessPoint.id.slice(0, 6)}...`;
  }
}
