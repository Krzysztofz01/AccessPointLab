import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2ManageComponent } from './accesspoint-details-v2-manage.component';

describe('AccesspointDetailsV2ManageComponent', () => {
  let component: AccesspointDetailsV2ManageComponent;
  let fixture: ComponentFixture<AccesspointDetailsV2ManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2ManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2ManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
