import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccesspointMapComponent } from './accesspoint-map/accesspoint-map.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent
  ]
})
export class SharedModule { }
