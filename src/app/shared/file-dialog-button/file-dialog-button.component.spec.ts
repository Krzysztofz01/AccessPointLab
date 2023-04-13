import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDialogButtonComponent } from './file-dialog-button.component';

describe('FileDialogButtonComponent', () => {
  let component: FileDialogButtonComponent;
  let fixture: ComponentFixture<FileDialogButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileDialogButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDialogButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
