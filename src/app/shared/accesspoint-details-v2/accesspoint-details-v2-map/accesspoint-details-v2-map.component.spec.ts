import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2MapComponent } from './accesspoint-details-v2-map.component';

describe('AccesspointDetailsV2MapComponent', () => {
  let component: AccesspointDetailsV2MapComponent;
  let fixture: ComponentFixture<AccesspointDetailsV2MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2MapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
