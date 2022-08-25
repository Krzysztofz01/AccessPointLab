import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { LoginModule } from './login/login.module';
import { ListModule } from './list/list.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadModule } from './upload/upload.module';
import { PreferencesModule } from './preferences/preferences.module';
import { DownloadModule } from './download/download.module';
import { RunModule } from './run/run.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule,
    UploadModule,
    PreferencesModule,
    DownloadModule,
    RunModule
  ],
  exports: [
    MainModule,
    LoginModule,
    ListModule,
    StatisticsModule,
    UploadModule,
    PreferencesModule,
    DownloadModule,
    RunModule
  ]
})
export class FeaturesModule { }
