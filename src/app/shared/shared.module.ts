import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AccesspointMapComponent } from './accesspoint-map/accesspoint-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccesspointDetailsComponent } from './accesspoint-details/accesspoint-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AccesspointListComponent } from './accesspoint-list/accesspoint-list.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { ToastComponent } from './toast/toast.component';
import { AccesspointMapFilterComponent } from './accesspoint-map/accesspoint-map-filter/accesspoint-map-filter.component';
import { AccesspointDetailsV2Component } from './accesspoint-details-v2/accesspoint-details-v2.component';
import { AccesspointDetailsV2GeneralComponent } from './accesspoint-details-v2/accesspoint-details-v2-general/accesspoint-details-v2-general.component';
import { AccesspointDetailsV2MapComponent } from './accesspoint-details-v2/accesspoint-details-v2-map/accesspoint-details-v2-map.component';
import { AccesspointDetailsV2DetailsComponent } from './accesspoint-details-v2/accesspoint-details-v2-details/accesspoint-details-v2-details.component';
import { AccesspointDetailsV2StampsComponent } from './accesspoint-details-v2/accesspoint-details-v2-stamps/accesspoint-details-v2-stamps.component';
import { AccesspointDetailsV2ManageComponent } from './accesspoint-details-v2/accesspoint-details-v2-manage/accesspoint-details-v2-manage.component';
import { OrderByPipe } from './accesspoint-list/order-by.pipe';



@NgModule({
  declarations: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointDetailsComponent,
    AccesspointListComponent,
    LoadingIndicatorComponent,
    ToastComponent,
    AccesspointMapFilterComponent,
    AccesspointDetailsV2Component,
    AccesspointDetailsV2GeneralComponent,
    AccesspointDetailsV2MapComponent,
    AccesspointDetailsV2DetailsComponent,
    AccesspointDetailsV2StampsComponent,
    AccesspointDetailsV2ManageComponent,
    OrderByPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule
  ],
  exports: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointListComponent,
    LoadingIndicatorComponent,
    ToastComponent,
    AccesspointDetailsV2Component
  ]
})
export class SharedModule { }
