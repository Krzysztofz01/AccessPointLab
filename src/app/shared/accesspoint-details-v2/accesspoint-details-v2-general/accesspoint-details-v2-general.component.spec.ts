import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2GeneralComponent } from './accesspoint-details-v2-general.component';

describe('AccesspointDetailsV2GeneralComponent', () => {
  let component: AccesspointDetailsV2GeneralComponent;
  let fixture: ComponentFixture<AccesspointDetailsV2GeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2GeneralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2GeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
