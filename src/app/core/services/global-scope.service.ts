import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalScopeService {
  private serverSubject = new BehaviorSubject<string>("");
  public server = this.serverSubject.asObservable();

  public setServer(server: string): void {
    this.serverSubject.next(server);
  }
}
