import { Component, Input } from '@angular/core';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointDetailsV2Utilities } from '../accesspoint-details-v2.utilities';

@Component({
  selector: 'app-accesspoint-details-v2-details',
  templateUrl: './accesspoint-details-v2-details.component.html',
  styleUrls: ['./accesspoint-details-v2-details.component.css']
})
export class AccesspointDetailsV2DetailsComponent {
  @Input() accessPoint: AccessPoint;
  @Input() hasAdminPermission: boolean;

  /**
   * Format array provided data. Method is using the utility class
   * @param serializedArray Array of string data
   */
   public formatSerialziedArrayData(serializedArray: string): string {
    return AccessPointDetailsV2Utilities.formatSerialziedArrayData(serializedArray);
  }

  /**
   * Format the date. Method is using the utility class
   * @param date 
   */
  public formatDate(date: Date): string {
    return AccessPointDetailsV2Utilities.formatDate(date);
  }
}
