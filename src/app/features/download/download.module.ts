import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    DownloadComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class DownloadModule { }
