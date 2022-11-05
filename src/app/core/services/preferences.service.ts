import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './local-storage.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly defaultPreferences: Preferences = {
    mapCenterLatitude: null,
    mapCenterLongitude: null,
    useLegacyDetailsView: false,
    disableClientSideCaching: false
  };

  constructor(
    private localStorageService: LocalStorageService,
    private loggerService: LoggerService) { }

  /**
   * Set the preferences to local storage or throw error on failure
   * @param property Preference property name
   * @param value Preference property value
   */
  setPreference(property: string, value: string): void {
    if (!this.localStorageService.test()) {
      this.loggerService.logError("The local storage is not supported. Preferences can not be applied.");
      throw Error();
    }

    if (!this.localStorageService.check(environment.LSK_PREFERENCES)) {
      this.localStorageService.set({ 
        key: environment.LSK_PREFERENCES,
        value: this.defaultPreferences
      });

      this.loggerService.logInformation("Default preferences initialized.");
    }

    const preferences = this.localStorageService.get(environment.LSK_PREFERENCES) as Preferences;   
    if (!Object.getOwnPropertyNames(preferences).some(prop => prop == property)) {      
      this.loggerService.logError("Invalid preference property or value.");
      throw Error();
    }

    (preferences as any)[property] = value;
    this.localStorageService.unset(environment.LSK_PREFERENCES);
    this.localStorageService.set({
      key: environment.LSK_PREFERENCES,
      value: preferences
    });

    this.loggerService.logInformation("Preference applied successful.");
  }

  /**
   * Retrive the preference from local storage
   * @param property Preference property name
   * @returns Preference property value
   */
  getPreference(property: string): any {
    if (!this.localStorageService.test()) {
      this.loggerService.logError("The local storage is not supported. Preferences can not be applied.");
      return null;
    }

    if (!this.localStorageService.check(environment.LSK_PREFERENCES)) {
      this.loggerService.logInformation("Preferences not initialized.");
      return null;
    }

    const preferences = this.localStorageService.get(environment.LSK_PREFERENCES) as Preferences;
    const resultProp = (preferences as any)[property];

    return (resultProp === undefined) ? null : resultProp;
  }
}

export interface Preferences {
  mapCenterLatitude: string | undefined;
  mapCenterLongitude: string | undefined;
  useLegacyDetailsView: boolean | undefined;
  disableClientSideCaching: boolean | undefined;
}
