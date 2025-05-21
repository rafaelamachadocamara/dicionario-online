import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicionarioListComponent } from './dicionario-list.component';

describe('DicionarioListComponent', () => {
  let component: DicionarioListComponent;
  let fixture: ComponentFixture<DicionarioListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicionarioListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicionarioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
