import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PreferencesService } from 'src/app/core/services/preferences.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-preferences',
  template: ''
})
export class PreferencesComponent implements OnInit {
  private readonly preferencePropertyParamName = "property";
  private readonly preferenceValueParamName = "value";

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private preferencesService: PreferencesService) { }

  ngOnInit(): void {
    try {
      const property = this.getRequestParam(this.preferencePropertyParamName);
      const value = this.getRequestParam(this.preferenceValueParamName);

      this.preferencesService.setPreference(property, value);
      this.toastService.setInformation("Preference applied successful.");
    } catch(error) {
      this.toastService.setError("Preferences are not available or the parameters are invalid.");
    }

    this.router.navigate(['']);
  }

  /**
   * Retrive and sanitize URL prams
   * @param paramName URL param name
   * @returns Retrived param from URL
   */
  private getRequestParam(paramName: string): string {
    const paramDirty = this.route.snapshot.queryParamMap.get(paramName);
    if (paramDirty === null) throw Error();

    try {
      return this.sanitizer.sanitize(SecurityContext.NONE, paramDirty);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
