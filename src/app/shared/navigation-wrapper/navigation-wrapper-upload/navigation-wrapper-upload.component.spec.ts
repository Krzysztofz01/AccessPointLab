import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationWrapperUploadComponent } from './navigation-wrapper-upload.component';

describe('NavigationWrapperUploadComponent', () => {
  let component: NavigationWrapperUploadComponent;
  let fixture: ComponentFixture<NavigationWrapperUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationWrapperUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationWrapperUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
