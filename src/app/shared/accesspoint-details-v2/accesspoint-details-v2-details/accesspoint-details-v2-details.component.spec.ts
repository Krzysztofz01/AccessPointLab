import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2DetailsComponent } from './accesspoint-details-v2-details.component';

describe('AccesspointDetailsV2DetailsComponent', () => {
  let component: AccesspointDetailsV2DetailsComponent;
  let fixture: ComponentFixture<AccesspointDetailsV2DetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2DetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
