import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ChartOptionGroup } from './chart-option-group.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnDestroy, OnInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  private readonly encryptionChartEntryLimit = 7;
  private readonly frequencyChartEntryLimit = 10;
  private readonly lineChartEntryLimit = 6;
  
  private readonly chartsColors = [
    '#5F0A87',
    '#831BB3',
    '#9B44C4',
    '#B35999',
    '#A24E8B',
    '#D072B7'
  ];

  public encryptionChartOptions: ChartOptionGroup;
  public frequencyChartOptions: ChartOptionGroup;
  public signalRangeChartOptions: ChartOptionGroup;
  public manufacturerChartOptions: ChartOptionGroup;

  constructor(private accessPointService: AccessPointService, private loggerService: LoggerService) { }
  
  ngOnInit(): void {
    this.initializeEncryptionChart();
    this.initializeFrequencyChart();
    this.initializeSignalRangeChart();
    this.initializeManufacturerChart();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Fetch encryption statistics and prepare chart options object
   */
  private initializeEncryptionChart(): void {
    this.accessPointService.getStatisticsMostCommonEncryption(this.encryptionChartEntryLimit, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (encryption) => {
          const labels = new Array<string>();
          const data = new Array<number>();

          if (encryption.length) {
            encryption.forEach((e: any) => {
              labels.push(e.encryption);
              data.push(e.count);
            });
          } else {
            labels.push('None');
            data.push(1);
          }

          this.encryptionChartOptions = {
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              }
            },
            type: 'pie',
            plugins: [],
            data: {
              labels,
              datasets: [{ 
                data,
                backgroundColor: this.chartsColors.slice(0, labels.length),
                hoverBackgroundColor: this.chartsColors.reverse().slice(0, labels.length),
                hoverBorderColor: this.chartsColors.reverse().slice(0, labels.length)
              }]
            }
          };
        },
        error: (error) => {
          this.loggerService.logError(error);
        }
      });
  }

  /**
   * Fetch frequency data and prepare chare options object
   */
  private initializeFrequencyChart(): void {
    this.accessPointService.getStatisticsFrequency(this.frequencyChartEntryLimit, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (frequency) => {
          const labels = new Array<string>();
          const data = new Array<number>();

          if (frequency.length) {
            frequency.forEach((e: any) => {
              labels.push(e.frequency);
              data.push(e.count);
            });
          } else {
            labels.push('None');
            data.push(1);
          }

          this.frequencyChartOptions = {
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              }
            },
            type: 'pie',
            plugins: [],
            data: {
              labels,
              datasets: [{
                data,
                backgroundColor: this.chartsColors.slice(0, labels.length),
                hoverBackgroundColor: this.chartsColors.reverse().slice(0, labels.length),
                hoverBorderColor: this.chartsColors.reverse().slice(0, labels.length)
              }]
            }
          };
        },
        error: (error) => {
          this.loggerService.logError(error);
        }
      })
  }

  /**
   * Fetch signal range data and prepare chare options object
   */
  private initializeSignalRangeChart(): void {
    this.accessPointService.getStatisticsGreatestSignalRange(this.lineChartEntryLimit, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessPoints) => {
          const labels = new Array<string>();
          const data = new Array<number>();

          if (accessPoints.length) {
            accessPoints.forEach(accessPoint => {
              labels.push(accessPoint.ssid);
              data.push(accessPoint.signalArea);
            });
          }

          this.signalRangeChartOptions = {
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              }
            },
            type: 'line',
            plugins: [],
            data: {
              labels,
              datasets: [{
                data,
                label: 'Count',
                borderColor: this.chartsColors.slice(0, 1)
              }]
            }
          };
        },
        error: (error) => {
          this.loggerService.logError(error);
        }
      });
  }

  /**
   * Fetch most common manufacturer and prepare chart options object
   */
  private initializeManufacturerChart(): void {
    this.accessPointService.getStatisticsMostCommonManufacturer(this.lineChartEntryLimit, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (manufacturer) => {
          const labels = new Array<string>();
          const data = new Array<number>();

          if (manufacturer.length) {
            manufacturer.forEach((e: any) => {
              labels.push(e.manufacturer);
              data.push(e.count);
            });
          }

          this.manufacturerChartOptions = {
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              }
            },
            type: 'line',
            plugins: [],
            data: {
              labels,
              datasets: [{
                data,
                label: 'Count',
                borderColor: this.chartsColors.slice(0, 1)
              }],
            }
          };
        },
        error: (error) => {
          this.loggerService.logError(error);
        }
      });
  }
}
