import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { NavbarComponent } from './navbar/navbar.component';



@NgModule({
  declarations: [
    AlertComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AlertComponent,
    NavbarComponent
  ]
})
export class SharedModule { }
