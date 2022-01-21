import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessPoint } from 'src/app/core/models/access-points.model';
import { AccessPointService } from 'src/app/core/services/access-point.service';
import { AccesspointDetailsComponent } from 'src/app/shared/accesspoint-details/accesspoint-details.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public accessPointsObservable: Observable<Array<AccessPoint>>;
  
  private hasFullPermission: boolean;
  
  private readonly accessPointIdParamName = 'id';
  private accessPointIdParamValue: string;

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private authService: AuthService, private accessPointService: AccessPointService) { }

  ngOnInit(): void {
    const role = this.authService.userValue.role;
    this.hasFullPermission = (role === environment.ROLE_SUPPORT || role === environment.ROLE_ADMIN);

    this.accessPointIdParamValue = this.route.snapshot.paramMap.get(this.accessPointIdParamName);
    if (this.accessPointIdParamValue !== null) this.createDetailsModalInstance([ this.accessPointIdParamValue ]);

    this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission);
  }

  /**
   * Selected AccessPoint marker event handler
   * @param e Event args
   */
  public showDetailsClick(e: any): void {
    this.createDetailsModalInstance(e as Array<string>);
  }

  /**
   * Create a new modal with details about one or many AccessPoint entites
   * @param accessPointIds Collection of AccessPoint entity ids
   */
  private createDetailsModalInstance(accessPointIds: Array<string>): void {
    const modalReference = this.modalService.open(AccesspointDetailsComponent, { modalDialogClass: 'modal-xl' });
    
    modalReference.componentInstance.accessPointsIds = accessPointIds;

    const changesSubscription = modalReference.componentInstance.accessPointUpdatedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission)
    }) as Subscription;

    const deleteSubscription = modalReference.componentInstance.accessPointDeletedEvent.subscribe({
      complete: () => this.accessPointsObservable = this.accessPointService.getAllAccessPoints(this.hasFullPermission)
    }) as Subscription;

    const unsubscribe = () => {
      changesSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };

    modalReference.result.then(() => unsubscribe(), () => unsubscribe());
  }
}
