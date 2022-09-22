import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DownloadRoutingModule } from './download-routing.module';



@NgModule({
  declarations: [
    DownloadComponent
  ],
  imports: [
    CommonModule,
    DownloadRoutingModule,
    SharedModule
  ]
})
export class DownloadModule { }
