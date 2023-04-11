import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationWrapperComponent } from './navigation-wrapper.component';

describe('NavigationWrapperComponent', () => {
  let component: NavigationWrapperComponent;
  let fixture: ComponentFixture<NavigationWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
