import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ListRoutingModule } from './list-routing.module';



@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    ListRoutingModule,
    SharedModule
  ]
})
export class ListModule { }
