import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { LoginModule } from './login/login.module';
import { ListModule } from './list/list.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadModule } from './upload/upload.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule,
    UploadModule
  ],
  exports: [
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule,
    UploadModule
  ]
})
export class FeaturesModule { }
