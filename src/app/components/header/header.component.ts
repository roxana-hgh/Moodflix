import { Component, inject, Inject, PLATFORM_ID, TemplateRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private offcanvasService = inject(NgbOffcanvas)
  isScrolled = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 0;
      });
    }
  }

  openMenu(content: TemplateRef<any>) {
		this.offcanvasService.open(content, { position: 'end' });
	}
}
