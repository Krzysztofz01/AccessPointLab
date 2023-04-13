import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-dialog-button',
  templateUrl: './file-dialog-button.component.html',
  styleUrls: ['./file-dialog-button.component.css']
})
export class FileDialogButtonComponent {
  @Input() id: string | undefined;
  @Output() fileSelectedEvent: EventEmitter<File> = new EventEmitter();
  
  /**
   * Check if the component state is valid
   * @returns Boolean value representing if the state is valid
   */
  public isValid(): boolean {
    if (this.id === undefined || this.id.length === 0) return false;
    return true;
  }

  /**
   * Emitt the open file dialog event file 
   * @param event File assing event
   */
  public assignSelectedFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.fileSelectedEvent.emit(file);
  }

  /**
   * Call the open file dialog selection via external button
   */
  public invokeFileDialog(): void {
    document.getElementById(this.id).click();    
  }
}
