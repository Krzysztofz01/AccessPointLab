import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalScopeService {
  private serverSubject = new BehaviorSubject<string>("");
  public server = this.serverSubject.asObservable();

  constructor(private cookieService: CookieService) {
    this.serverSubject.next(this.cookieService.get(environment.SERVER_URL_COOKIE_NAME));
  }

  /**
  * Set the current server scope
  * @param server Server url
  */
  public setServer(server: string): void {
    this.serverSubject.next(server);

    this.cookieService.set(environment.SERVER_URL_COOKIE_NAME, server, {
      sameSite: "None"
    });
  }
}
