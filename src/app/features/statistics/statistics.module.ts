import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatisticsRoutingModule } from './statistics-routing.module';



@NgModule({
  declarations: [
    StatisticsComponent
  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    NgChartsModule,
    SharedModule
  ]
})
export class StatisticsModule { }
