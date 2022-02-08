import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspointListComponent } from './accesspoint-list.component';

describe('AccesspointListComponent', () => {
  let component: AccesspointListComponent;
  let fixture: ComponentFixture<AccesspointListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspointListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspointListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
