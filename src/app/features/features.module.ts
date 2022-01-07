import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { LoginModule } from './login/login.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainModule,
    LoginModule
  ],
  exports: [
    MainModule,
    LoginModule
  ]
})
export class FeaturesModule { }
