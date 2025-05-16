import { Component, inject, Inject, PLATFORM_ID, TemplateRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MoviesService } from '../../services/movies.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private offcanvasService = inject(NgbOffcanvas)
  private searchSubject = new Subject<string>();
  isScrolled = false;
  isCollapsed = true;
  searchResults: any[] = [];
  imageUrl: string = environment.tmdb.imagesUrl;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private moviesServices: MoviesService, private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 0;
      });
    }
  }

  searchMovies(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchResults = [];
    // Use the searchSubject to debounce the input
    this.searchSubject.pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe(query => {
        if (query.length > 1) {
          this.moviesServices.searchMovies(query).subscribe(
            (response) => {
              this.searchResults = response.results;
            },
            (error) => {
              console.error('Error fetching search results:', error);
            }
          );
        }
      });

    this.searchSubject.next(query);

  }

  goToDetail($event: Event ,media_type: boolean, id: number) {
    $event.preventDefault()
    // const mediaType = media_type ? 'tv' : 'movie';
    this.router.navigate([`/${media_type}`, id]);
  }

  openMenu(content: TemplateRef<any>) {
		this.offcanvasService.open(content, { position: 'end' });
	}
}
