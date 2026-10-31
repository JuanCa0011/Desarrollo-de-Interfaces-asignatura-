import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { LibrosService } from '../core/services/libros.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    TestBed.overrideProvider(LibrosService, {
      useValue: { listAll: () => Promise.resolve([]) },
    });

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
