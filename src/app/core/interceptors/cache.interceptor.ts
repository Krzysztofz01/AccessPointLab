import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';  
import { environment } from 'src/environments/environment';
import { LoggerService } from '../services/logger.service';
import { PreferencesService } from '../services/preferences.service';


@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: Map<string, HttpResponse<unknown>> = new Map();

  private readonly cachePreferenceKey = "disableClientSideCaching";

  constructor(
    private preferencesService: PreferencesService,
    private loggerService: LoggerService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const disableCaching = this.preferencesService.getPreference(this.cachePreferenceKey) as string;
    if (disableCaching !== undefined && disableCaching.toLowerCase() === "true") {
      this.loggerService.logInformation("Caching disabled by preference.");
      return next.handle(request);
    }

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
