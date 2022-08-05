import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2Component } from './accesspoint-details-v2.component';

describe('AccesspointDetailsV2Component', () => {
  let component: AccesspointDetailsV2Component;
  let fixture: ComponentFixture<AccesspointDetailsV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
