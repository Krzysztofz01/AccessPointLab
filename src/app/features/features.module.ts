import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from './main/main.module';
import { LoginModule } from './login/login.module';
import { ListModule } from './list/list.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainModule,
    LoginModule,
    ListModule
  ],
  exports: [
    MainModule,
    LoginModule,
    ListModule
  ]
})
export class FeaturesModule { }
