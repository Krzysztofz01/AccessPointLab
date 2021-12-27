import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { AuthModule } from '../auth/auth.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    MainModule,
    AuthModule
  ]
})
export class FeaturesModule { }
