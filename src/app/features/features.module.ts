import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { LoginModule } from './login/login.module';
import { ListModule } from './list/list.module';
import { StatisticsModule } from './statistics/statistics.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule
  ],
  exports: [
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule
  ]
})
export class FeaturesModule { }
