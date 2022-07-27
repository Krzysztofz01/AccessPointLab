import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';  
import { environment } from 'src/environments/environment';
import { LoggerService } from '../services/logger.service';
import { LocalStorageService } from '../services/local-storage.service';

//TODO: Implement cache resolving from local storage. Map object serialization
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: Map<string, HttpResponse<unknown>> = new Map();

  constructor(private localStorageService: LocalStorageService, private loggerService: LoggerService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestPath = request.urlWithParams;

    if (request.method !== 'GET' || requestPath === undefined)
      return next.handle(request);

    const cachingHeaderPresent = request.headers.get(environment.HEADER_ALLOW_LOCAL_CACHE_NAME) !== null;
    const responseIsCached = this.isResponseInCache(requestPath);

    if (cachingHeaderPresent && responseIsCached)
      return of(this.getResponseFromCache(requestPath));

    if (!cachingHeaderPresent && !responseIsCached)
      return next.handle(request);

    return next.handle(request)
      .pipe(tap(event => this.addResponseToCache(requestPath, event)));
  }

  /**
   * @deprecated
   * Retrievie presisted cache lookup map from local storage or initializea fresh lookup map
   * @returns Stored or freshly initialzied cache lookup map
   */
  private initializePersistantCache(): Map<string, HttpResponse<unknown>> {
    if (!this.localStorageService.test()) return new Map();

    return new Map();
  }

  /**
   * Add response to local cache
   * @param requestPath Request identifier
   * @param event HTTP event object which is representing the response
   */
   private addResponseToCache(requestPath: string, event: HttpEvent<unknown>): void {
    if (!(event instanceof HttpResponse)) return;
    
    this.cache.set(requestPath, event);

    this.loggerService.logInformation(`Requested response from: ${requestPath} cached.`);
  }

  /**
   * @deprecated
   * Remove cached element from cache
   * @param requestPath Request identifier
   */
  private removeResponseFromCache(requestPath: string): void {
    this.cache.delete(requestPath);

    this.loggerService.logInformation(`Requested response from: ${requestPath} removed from cache.`);
  }

  /**
   * Retrieve cache response or undefined if not present
   * @param requestPath Request identifier
   * @returns Response object
   */
  private getResponseFromCache(requestPath: string): HttpResponse<unknown> | undefined {
    const cachedResponse = this.cache.get(requestPath);
    if (cachedResponse) {
      this.loggerService.logInformation(`Requested response from: ${requestPath} resolved from cache.`);
      return cachedResponse.clone();
    }
    
    this.loggerService.logInformation(`Requested response from: ${requestPath} not found in local cache.`);
    return undefined;
  }

  /**
   * Check if a response represented by given identifier it currently cached
   * @param requestPath Request identifier
   * @returns Boolean value representing if the request response is cached
   */
  private isResponseInCache(requestPath: string): boolean {
    return this.cache.has(requestPath);
  }
}
