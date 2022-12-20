import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunComponent } from './run.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RunRoutingModule } from './run-routing.module';



@NgModule({
  declarations: [
    RunComponent
  ],
  imports: [
    CommonModule,
    RunRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class RunModule { }
