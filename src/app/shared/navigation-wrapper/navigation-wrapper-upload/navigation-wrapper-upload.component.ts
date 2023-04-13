import { Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-navigation-wrapper-upload',
  templateUrl: './navigation-wrapper-upload.component.html',
  styleUrls: ['./navigation-wrapper-upload.component.css']
})
export class NavigationWrapperUploadComponent implements OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(
    private modal: NgbActiveModal,
    private accessPointService: AccessPointService,
    private loggerService: LoggerService,
    private toastService: ToastService) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Submit the upload of the default AccessPointMap scan file
   * Temporary workaround. The post endpoint has no json file support.
   */
  public submitUploadDefault(file: File): void {
    if (!this.isFileTypeValid(file, 'json')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      var accessPoints = JSON.parse(fileReader.result.toString()) as Array<AccessPoint>;

      this.accessPointService.postAccessPoints(accessPoints)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.toastService.setInformation("Upload successful.");
          },
          error: (error) => {
            this.loggerService.logError(error);
            this.toastService.setError("Upload failed.");
          }
        });
    }

    fileReader.readAsText(file);
  }

  /**
   * Submit the upload of the WiGLE scan file
   */
  public submitUploadWigle(file: File): void {
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    this.accessPointService.postAccessPointsWigleCsv(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Upload failed.");
        }
      });
  }

  /**
   * Submit the upload of the WiGLE CSV.GZ scan file
   */
  public submitUploadWigleCsvGz(file: File): void {
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    this.accessPointService.postAccessPointsWigleCsvGz(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Upload failed.");
        }
      });
  }

  /**
   * Submit the upload of the Aircrack-ng scan file
   */
  public submitUploadAircrackng(file: File): void {
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    this.accessPointService.postAccessPointsAircrackngCsv(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Upload failed.");
        }
      });
  }

  /**
   * Submit the upload of the Aircrack-ng cap scan file
   */
  public submitUploadAircrackngCap(file: File): void {
    if (!this.isFileTypeValid(file, 'cap')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    this.accessPointService.postAccessPointsPacketsAircrackngCap(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Upload failed.");
        }
      });
  }

  /**
   * Submit the upload of the Wireshrak pcap scan file
   */
  public submitUploadWiresharkPcap(file: File): void {
    if (!this.isFileTypeValid(file, 'pcap')) {
      this.toastService.setError("Invalid file format.");
      return;
    }

    this.accessPointService.postAccessPointsPacketsWiresharkPcap(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Upload failed.");
        }
      });
  }

  /**
   * Validate if the correct file type is usde
   * @param file File to check
   * @param expectedType Expected file extension
   * @returns Boolean value indication if the file is valid
   */
  private isFileTypeValid(file: File, expectedType: string): boolean {
    if (!file) return false;

    const extension = file.name.split('.')[1].toLocaleLowerCase();
    if (extension !== expectedType.toLocaleLowerCase()) return false;

    return true;
  }

  /**
   * Dismiss the current modal instance
   */
  public closeModal(): void {
    this.modal.close(undefined);
  }
}
