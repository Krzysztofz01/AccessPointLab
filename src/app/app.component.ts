import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<router-outlet><app-loading-indicator></app-loading-indicator></router-outlet>`
})
export class AppComponent {
  title = 'AccessPointLab';
}
