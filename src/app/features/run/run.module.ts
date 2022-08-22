import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunComponent } from './run.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    RunComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class RunModule { }
