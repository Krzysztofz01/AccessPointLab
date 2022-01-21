import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccesspointMapComponent } from './accesspoint-map/accesspoint-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccesspointDetailsComponent } from './accesspoint-details/accesspoint-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule
  ],
  exports: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointDetailsComponent
  ]
})
export class SharedModule { }
