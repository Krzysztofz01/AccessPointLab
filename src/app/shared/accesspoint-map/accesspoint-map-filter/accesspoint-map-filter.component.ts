import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { AccessPointMapFilterResult } from '../accesspoint-map-filter-result.interface';
import { EncryptionTypes } from '../encryption-types.enum';

@Component({
  selector: 'app-accesspoint-map-filter',
  templateUrl: './accesspoint-map-filter.component.html',
  styleUrls: ['./accesspoint-map-filter.component.css']
})
export class AccesspointMapFilterComponent implements OnInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  @Output() filterChangedEvent = new EventEmitter<AccessPointMapFilterResult>();
  
  public keywordFilterForm: FormGroup;
  public securityStandard: FormGroup;
  public startingDate: NgbDate | undefined;
  public endingDate: NgbDate | undefined;

  public readonly encryptionTypesArray = Object.values(EncryptionTypes).filter(value => typeof value === 'string') as Array<String>;
  public readonly defaultSelectedEncryptionType = EncryptionTypes[EncryptionTypes.All];

  ngOnInit(): void {
    this.securityStandard = new FormGroup({
      selectedSecurityStandard: new FormControl(this.defaultSelectedEncryptionType)
    });

    this.keywordFilterForm = new FormGroup({
      keyword: new FormControl("")
    });

    this.securityStandard.get('selectedSecurityStandard').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.filterValuesChanged());

    this.keywordFilterForm.get('keyword').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.filterValuesChanged());
  }

  /**
   * Emitt all the values from the filter forms
   */
  public filterValuesChanged(): void {
    const nativeStartingDate: Date | undefined = (this.startingDate !== undefined)
      ? new Date(this.startingDate.year, this.startingDate.month - 1, this.startingDate.day)
      : undefined;

    const nativeEndingDate: Date | undefined = (this.endingDate !== undefined)
      ? new Date(this.endingDate.year, this.endingDate.month - 1, this.endingDate.day)
      : undefined;
    
    const filterResults: AccessPointMapFilterResult = {
      keyword: this.keywordFilterForm.get('keyword').value,
      securityStandard: this.securityStandard.get('selectedSecurityStandard').value,
      startingDate: nativeStartingDate,
      endingDate: nativeEndingDate
    }

    this.filterChangedEvent.emit(filterResults);
  }
}
