import {
  Component,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
} from '@angular/core';
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
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private offcanvasService = inject(NgbOffcanvas);
  isScrolled = false;
  private _isCollapsed = true;
  searchResults: any[] = [];
  searchSubject = new Subject<string>();
  isLoading = false;
  imageUrl = environment.tmdb.imagesUrl;
  searchQuery: string = '';

  get isCollapsed(): boolean {
    return this._isCollapsed;
  }

  set isCollapsed(value: boolean) {
    this._isCollapsed = value;
    if (value) {
      this.searchResults = [];
      this.searchQuery = '';
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private moviesServices: MoviesService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 0;
      });
    }
  }

  ngOnInit(): void {
    
  }

  searchMovies() {
    this.searchResults = [];
    this.isLoading = true;
    const query = this.searchQuery;
    // Use the searchSubject to debounce the input
    this.searchSubject
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((query) => {
        if (query.length > 1) {
          this.moviesServices.searchMovies(query).subscribe(
            (response) => {
              this.searchResults = response.results;
              this.isLoading = false;
            },
            (error) => {
              console.error('Error fetching search results:', error);
            }
          );
        }
      });

    this.searchSubject.next(this.searchQuery);
  }

  goToDetail($event: Event, media_type: boolean, id: number) {
    $event.preventDefault();
    // const mediaType = media_type ? 'tv' : 'movie';
    this.searchResults = []; // Clear search results
    this.isCollapsed = true; // Close the sidebar
    this.searchQuery = '';
    this.router.navigate([`/${media_type}`, id]);
  }

  openMenu(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }
}
