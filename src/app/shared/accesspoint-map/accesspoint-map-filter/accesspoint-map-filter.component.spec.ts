import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointMapFilterComponent } from './accesspoint-map-filter.component';

describe('AccesspointMapFilterComponent', () => {
  let component: AccesspointMapFilterComponent;
  let fixture: ComponentFixture<AccesspointMapFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointMapFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspointMapFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
