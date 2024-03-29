import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { LoggerService } from 'src/app/core/services/logger.service';
import { AccessPointRangeDisplayStatusEvent } from './accesspoint-range-display-status-event.interface';

@Component({
  selector: 'app-accesspoint-list',
  templateUrl: './accesspoint-list.component.html',
  styleUrls: ['./accesspoint-list.component.css']
})
export class AccesspointListComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() accessPointObservable: Observable<Array<AccessPoint>>;
  @Output() accessPointClick = new EventEmitter<AccessPoint>(false);
  @Output() accessPointRangeDeletedClick = new EventEmitter<Array<AccessPoint>>(undefined);
  @Output() accessPointRangeDisplayStatusClick = new EventEmitter<AccessPointRangeDisplayStatusEvent>(undefined);

  private accessPoints: Array<AccessPoint>;
  public filteredAccessPoints: Array<AccessPoint>;

  public checkedAll: boolean = false;

  public searchKeyword: string = '';
  public lastSearchKeyword: string = '';
  public key: string = 'id';
  public reverse: boolean = false;

  constructor(
    private loggerService: LoggerService) { }

  ngOnInit(): void {
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
          this.applyKeywordFilterToAccessPointCollection(this.accessPoints);
        },
        error: (error) => this.loggerService.logError(error)
      });
  }

  /**
   * Apply filters on the access point collection, add check-value and store it into the filtered access point collection
   * @param accessPoints AccessPoint entity collection
   */
  private applyKeywordFilterToAccessPointCollection(accessPoints: Array<AccessPoint>): void {
    if (!this.filteredAccessPoints || this.searchKeyword.length === 0) {
      this.filteredAccessPoints = accessPoints.map((accessPoint) => ({
        simplifiedSecurityStandard: this.parseSecurityName(accessPoint),
        checked: false,
        ...accessPoint
      }));

      return;
    }

    if (!this.searchKeyword || this.searchKeyword.length < 3) return;
    
    this.filteredAccessPoints = this.filterAccessPointByKeyword(accessPoints).map((accessPoint) => ({
      simplifiedSecurityStandard: this.parseSecurityName(accessPoint),
      checked: false,
      ...accessPoint
    }));
  }

  /**
   * Apply the keyword filters to a collection of AccessPoint entities
   * @param accessPoints Collection of AccessPoint Entities
   * @returns Collection of AccessPoint Entities
   */
  private filterAccessPointByKeyword(accessPoints: Array<AccessPoint>): Array<AccessPoint> {
    const searchKeyword = this.searchKeyword
      .trim().toLowerCase();

    return accessPoints.filter(ap => {
      const searchLookup = ''.concat(
        ap.ssid,
        ap.bssid,
        ap.manufacturer,
        ap.rawSecurityPayload,
        ap.deviceType,
        ap.runIdentifier
      ).toLowerCase();

      return searchLookup.includes(searchKeyword);
    });
  }

  /**
   * Mark all entities as checked or unchecked depending of the checkedAll value
   */
  public checkedAllChanged(): void {
    this.filteredAccessPoints.forEach((accessPoint) => {
      (accessPoint as any).checked = this.checkedAll;
    })
  }

  /**
   * Emitt the event of clicking the delete button to parent
   */
  public deleteAccessPointRange(): void {
    const targetAccessPoints = this.filteredAccessPoints.filter((accessPoint) => {
      return (accessPoint as any).checked
    });

    this.accessPointRangeDeletedClick.next(targetAccessPoints);

    this.accessPoints = this.accessPoints.filter((accessPoint) => {
      return !targetAccessPoints.some((target) => target.id === accessPoint.id);
    });

    this.applyKeywordFilterToAccessPointCollection(this.accessPoints);
  }

  /**
   * Emitt the event of clicking the display status change (to display) button to parent
   */
  public changeAccessPointDisplayStatusRangeDisplay(): void {
    const targetAccessPoints = this.filteredAccessPoints.filter((accessPoint) => {
      return (accessPoint as any).checked
    });

    this.accessPointRangeDisplayStatusClick.next({
      accessPoints: targetAccessPoints,
      targetStatus: true
    });

    this.accessPoints.forEach((accessPoint) => {
      if (targetAccessPoints.some((target) => target.id === accessPoint.id)) {
        accessPoint.displayStatus = true;
      }
    });

    this.applyKeywordFilterToAccessPointCollection(this.accessPoints);
  }

  /**
   * Emitt the event of clicking the display status change (to hide) button to parent
   */
  public changeAccessPointDisplayStatusRangeHide(): void {
    const targetAccessPoints = this.filteredAccessPoints.filter((accessPoint) => {
      return (accessPoint as any).checked
    });

    this.accessPointRangeDisplayStatusClick.next({
      accessPoints: targetAccessPoints,
      targetStatus: false
    });

    this.accessPoints.forEach((accessPoint) => {
      if (targetAccessPoints.some((target) => target.id === accessPoint.id)) {
        accessPoint.displayStatus = false;
      }
    });

    this.applyKeywordFilterToAccessPointCollection(this.accessPoints);
  }

  /**
   * Reinitialize AccessPoint entity collection with keyword. Method used by the ng2-search-filter dependency
   */
  public searchAccessPoints(): void {
    this.applyKeywordFilterToAccessPointCollection(this.accessPoints);
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
   * Get the corresponding CSS color value based on the security standard
   * @param accessPoint AccessPoint entity
   * @returns CSS color param
   */
  public getCssSecurityColor(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.securityStandards);

    if(sd.includes('WPA3')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA2')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPA')) return 'var(--apm-encryption-good)';
    if(sd.includes('WPS')) return 'var(--apm-encryption-medium)';
    if(sd.includes('WEP')) return 'var(--apm-encryption-medium)';
    return 'var(--apm-encryption-bad)';
  }

  /**
   * Generate a simplified security standard information
   * @param accessPoint AccessPoint entity
   * @returns Simplified encryption information 
   */
  private parseSecurityName(accessPoint: AccessPoint): string {
    const sd: Array<string> = JSON.parse(accessPoint.securityStandards);

    if(sd.includes('WPA3')) return 'WPA3';
    if(sd.includes('WPA2')) return 'WPA2';
    if(sd.includes('WPA')) return 'WPA';
    if(sd.includes('WPS')) return 'WPS';
    if(sd.includes('WEP')) return 'WEP';
    return 'None';
  }

  /**
   * Generate a table and user friendly representation of the AccessPoints manufacturer
   * @param accessPoint AccessPoint entity
   * @returns Manufacturer name
   */
  public getManufacturerName(accessPoint: AccessPoint): string {
    return (accessPoint.manufacturer === undefined || accessPoint.manufacturer === '') ? 'Unknown' : accessPoint.manufacturer;
  }

  /**
   * Format the date to more user friendly format
   * @param date Date object
   * @returns Formated date as string
   */
  public formatDate(date: Date | string): string {
    if (date === undefined) return 'Unknown';
    const dateFormat = 'dd-MM-yyyy HH:mm:ss';
    return (date instanceof Date)
        ? format(new Date(date), dateFormat)
        : format(parseISO(date), dateFormat);
  }
}
