import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  public defaultUploadForm: FormGroup;
  public wigleUploadForm: FormGroup;
  public aircrackngUploadForm: FormGroup;

  constructor(private accessPointService: AccessPointService) { }
  
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
    this.defaultUploadForm = new FormGroup({
      file: new FormControl(null, [ Validators.required ])
    });

    this.wigleUploadForm = new FormGroup({
      file: new FormControl(null, [ Validators.required ])
    });

    this.aircrackngUploadForm = new FormGroup({
      file: new FormControl(null, [ Validators.required ])
    });
  }

  /**
   * Set the selected file to the form-groups control
   * @param e Event argument
   * @param form Target form-group
   */
  public assignFileToControlOnChange(e: any, form: FormGroup): void {
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
    if (!this.defaultUploadForm.valid) return;
    
    const file = this.defaultUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'json')) return;

    const fileReader = new FileReader();

    fileReader.onload = () => {
      var accessPoints = JSON.parse(fileReader.result.toString()) as Array<AccessPoint>;

      this.accessPointService.postAccessPoints(accessPoints)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          complete: () => {
            this.defaultUploadForm.reset();
          },
          error: (error) => {
            console.error(error);
          }
        });
    }
    
    fileReader.readAsText(file);
  }

  /**
   * Submit the upload of the WiGLE scan file
   */
  public submitUploadWigle(): void {
    if (!this.wigleUploadForm.valid) return;
    
    const file = this.wigleUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'csv')) return;

    this.accessPointService.postAccessPointsWigle(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.wigleUploadForm.reset();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  /**
   * Submit the upload of the Aircrack-ng scan file
   */
  public submitUploadAircrackng(): void {
    if (!this.aircrackngUploadForm.valid) return;
    
    const file = this.aircrackngUploadForm.get('file').value as File;
    if (!this.isFileTypeValid(file, 'csv')) return;
    
    this.accessPointService.postAccessPointsAircrackng(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          this.aircrackngUploadForm.reset();
        },
        error: (error) => {
          console.error(error);
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