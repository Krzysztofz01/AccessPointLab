import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalScopeService {
  private serverSubject = new BehaviorSubject<string>("");
  public server = this.serverSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {
    this.serverSubject.next(this.localStorageService.get(environment.LSK_SERVER));
  }

  /**
  * Set the current server scope
  * @param server Server url
  */
  public setServer(server: string): void {
    const protocolPart = "http://";

    const serverWithProtocol = !server.startsWith(protocolPart) 
      ? `${protocolPart}${server}` : server;

    this.serverSubject.next(serverWithProtocol);

    this.localStorageService.set({
      key: environment.LSK_SERVER,
      value: serverWithProtocol,
      expirationMinutes: null
    });
  }
}
