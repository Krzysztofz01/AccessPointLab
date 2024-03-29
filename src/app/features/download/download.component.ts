import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  private hasFullPermission: boolean;

  constructor(
    private accessPointService: AccessPointService,
    private authService: AuthService,
    private toastService: ToastService,
    private loggerService: LoggerService) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Button click method for downloading the kml file
   */
  public downloadNativeKml(): void {
    this.accessPointService.getAccessPointsInKmlFile(this.hasFullPermission)
      .pipe(takeUntil(this.destroy$))  
      .subscribe({
        next: (responseBlob) => {
          var fileBlob = new Blob([responseBlob], { type: "text/kml" })
          this.handleFileDownload(fileBlob, "kml");
          this.toastService.setInformation("Download successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Download failed.");
        }
      });
  }

  /**
   * Button click method for downloading the WiGLE csv file
   */
  public downloadWigleCsv(): void {
    this.accessPointService.getAccessPointsWigleCsv()
      .pipe(takeUntil(this.destroy$))  
      .subscribe({
        next: (responseBlob) => {
          var fileBlob = new Blob([responseBlob], { type: "text/csv" })
          this.handleFileDownload(fileBlob, "csv");
          this.toastService.setInformation("Download successful.");
        },
        error: (error) => {
          this.loggerService.logError(error);
          this.toastService.setError("Download failed.");
        }
      });
  }

  /**
   * File download helper method. The method is creating and disposing required URL utilities
   * @param fileBlob File in blob format
   * @param fileExtension Targe file extension (without the dot)
   */
  private handleFileDownload(fileBlob: Blob, fileExtension: string): void {
    const date = new Date();
    const fileName = `${date.toISOString()}.${fileExtension.toLowerCase()}`;

    const downloadUrlObj = window.URL.createObjectURL(fileBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrlObj;
    downloadLink.download = fileName;
    
    downloadLink.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrlObj);
      downloadLink.remove();
    }, 100);
  }

}
