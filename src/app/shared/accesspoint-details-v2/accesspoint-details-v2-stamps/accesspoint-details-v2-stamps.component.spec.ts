import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsV2StampsComponent } from './accesspoint-details-v2-stamps.component';

describe('AccesspointDetailsV2StampsComponent', () => {
  let component: AccesspointDetailsV2StampsComponent;
  let fixture: ComponentFixture<AccesspointDetailsV2StampsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsV2StampsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspointDetailsV2StampsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
