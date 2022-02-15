import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalScopeService } from './services/global-scope.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { LocalStorageService } from './services/local-storage.service';
import { AccessPointService } from './services/access-point.service';
import { LoadingIndicatorInterceptor } from './interceptors/loading-indicator.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingIndicatorInterceptor, multi: true },
    
    // The app-intializer is working unefficient, long routing time.
    //{ provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },

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