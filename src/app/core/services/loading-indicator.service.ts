import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorService {
  public isLoading = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  /**
   * Change the current state of loaded resources
   * @param loadingUrl Loading request identifier
   * @param loadingStatus Loading status
   */
  public setLoading(loadingUrl: string, loadingStatus: boolean): void {
    if (!loadingUrl) throw new Error('Invalid loading url identifier.');

    if (loadingStatus) {
      this.loadingMap.set(loadingUrl, loadingStatus);
      this.isLoading.next(true);
    }

    if (!loadingStatus && this.loadingMap.has(loadingUrl)) {
      this.loadingMap.delete(loadingUrl)
    }

    if (this.loadingMap.size === 0) {
      this.isLoading.next(false);
    }
  }
}
