import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {catchError, map} from 'rxjs/operators'
import { LoadingIndicatorService } from '../services/loading-indicator.service';

@Injectable()
export class LoadingIndicatorInterceptor implements HttpInterceptor {

  constructor(public loadingIndicatorService: LoadingIndicatorService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const loadingId = request.urlWithParams;
    this.loadingIndicatorService.setLoading(loadingId, true);

    // TODO: This soultion is fixing the problem with the inidicator disabling before async operation end
    // but is not using sepecific types on map pipe (quick work around). Fix later
    return next.handle(request)
      .pipe(catchError((err) => {
        this.loadingIndicatorService.setLoading(loadingId, false);
        
        return err;
      }))
      .pipe(map<any, any>((event) => {
        if (event instanceof HttpResponse) {
          this.loadingIndicatorService.setLoading(loadingId, false);
        }

        return event;
      }));
    
    // Old soultion which was causing problems
    //
    // try {
    //   this.loadingIndicatorService.isLoading.next(true);
    //   console.log("Load started")
    
    //   return next.handle(request).pipe(
    //     finalize(() => {
    //       this.loadingIndicatorService.isLoading.next(false);
    //       console.log("Load finished")
    //     })
    //   );

    // } catch (error) {
    //   console.error(error)
    //   this.loadingIndicatorService.isLoading.next(false);
    //   console.log("Load finished")
    // }

    // return next.handle(request);
  }
}
