import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  public defaultUploadForm: UntypedFormGroup;
  public wigleUploadForm: UntypedFormGroup;
  public wigleUploadCsvGzForm: UntypedFormGroup
  public aircrackngUploadForm: UntypedFormGroup;
  public aircrackngCapUploadForm: UntypedFormGroup;
  public wiresharkPcapUploadForm: UntypedFormGroup;

  constructor(
    private accessPointService: AccessPointService,
    private toastService: ToastService,
    private loggerService: LoggerService) { }
  
  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Initialize scan data upload forms
   */
  private initializeForms(): void {
    this.defaultUploadForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [ Validators.required ])
    });

    this.wigleUploadForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [ Validators.required ])
    });

    this.wigleUploadCsvGzForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [Validators.required])
    });

    this.aircrackngUploadForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [ Validators.required ])
    });

    this.aircrackngCapUploadForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [ Validators.required ])
    });

    this.wiresharkPcapUploadForm = new UntypedFormGroup({
      file: new UntypedFormControl(null, [ Validators.required ])
    });
  }

  /**
   * Set the selected file to the form-groups control
   * @param e Event argument
   * @param form Target form-group
   */
  public assignFileToControlOnChange(e: any, form: UntypedFormGroup): void {
    if (e === undefined || form === undefined) return;
    
    const input = e.target as HTMLInputElement;
    if (input.files.length < 1) return;
    
    const file = input.files[0];
    form.get('file').setValue(file);
  }

  /**
   * Submit the upload of the default AccessPointMap scan file
   * Temporary workaround. The post endpoint has no json file support.
   */
  public submitUploadDefault(): void {
    if (!this.defaultUploadForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }
    
    const file = this.defaultUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'json')) {
      this.toastService.setError("Invalid file format.");
      this.defaultUploadForm.reset();
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
            this.defaultUploadForm.reset();
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
  public submitUploadWigle(): void {
    if (!this.wigleUploadForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }
    
    const file = this.wigleUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      this.wigleUploadForm.reset();
      return;
    }

    this.accessPointService.postAccessPointsWigleCsv(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
          this.wigleUploadForm.reset();
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
  public submitUploadWigleCsvGz(): void {
    if (!this.wigleUploadCsvGzForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }

    const file = this.wigleUploadCsvGzForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      this.wigleUploadForm.reset();
      return;
    }

    this.accessPointService.postAccessPointsWigleCsvGz(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
          this.wigleUploadCsvGzForm.reset();
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
  public submitUploadAircrackng(): void {
    if (!this.aircrackngUploadForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }
    
    const file = this.aircrackngUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'csv')) {
      this.toastService.setError("Invalid file format.");
      this.aircrackngUploadForm.reset();
      return;
    }
    
    this.accessPointService.postAccessPointsAircrackngCsv(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
          this.aircrackngUploadForm.reset();
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
  public submitUploadAircrackngCap(): void {
    if (!this.aircrackngCapUploadForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }
    
    const file = this.aircrackngCapUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'cap')) {
      this.toastService.setError("Invalid file format.");
      this.aircrackngCapUploadForm.reset();
      return;
    }
    
    this.accessPointService.postAccessPointsPacketsAircrackngCap(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
          this.aircrackngCapUploadForm.reset();
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
  public submitUploadWiresharkPcap(): void {
    if (!this.wiresharkPcapUploadForm.valid) {
      this.toastService.setError("Select a file to upload it.");
      return;
    }
    
    const file = this.wiresharkPcapUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'pcap')) {
      this.toastService.setError("Invalid file format.");
      this.wiresharkPcapUploadForm.reset();
      return;
    }
    
    this.accessPointService.postAccessPointsPacketsWiresharkPcap(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.toastService.setInformation("Upload successful.");
          this.wiresharkPcapUploadForm.reset();
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
    if (extension !==  expectedType.toLocaleLowerCase()) return false;    
    
    return true;
  }
}
