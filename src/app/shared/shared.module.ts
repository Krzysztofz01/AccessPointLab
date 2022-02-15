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
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';



@NgModule({
  declarations: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointDetailsComponent,
    AccesspointListComponent,
    LoadingIndicatorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    OrderModule
  ],
  exports: [
    AlertComponent,
    NavbarComponent,
    AccesspointMapComponent,
    AccesspointDetailsComponent,
    AccesspointListComponent,
    LoadingIndicatorComponent
  ]
})
export class SharedModule { }
