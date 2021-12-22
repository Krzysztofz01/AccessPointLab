import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalScopeService } from './services/global-scope.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    GlobalScopeService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if(parentModule) {
      throw new Error('Core module is already created! Only one instance should exist!');
    }
  }
}