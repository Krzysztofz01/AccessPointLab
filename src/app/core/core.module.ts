import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalScopeService } from './services/global-scope.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { LocalStorageService } from './services/local-storage.service';
import { AccessPointService } from './services/access-point.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },

    GlobalScopeService,
    LocalStorageService,
    AccessPointService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if(parentModule) {
      throw new Error('Core module is already created! Only one instance should exist!');
    }
  }
}