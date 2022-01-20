import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointDetailsComponent } from './accesspoint-details.component';

describe('AccesspointDetailsComponent', () => {
  let component: AccesspointDetailsComponent;
  let fixture: ComponentFixture<AccesspointDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspointDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
