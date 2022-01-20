import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointMapComponent } from './accesspoint-map.component';

describe('AccesspointMapComponent', () => {
  let component: AccesspointMapComponent;
  let fixture: ComponentFixture<AccesspointMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspointMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
