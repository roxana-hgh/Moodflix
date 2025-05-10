import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movies-card',
  templateUrl: './movies-card.component.html',
  styleUrl: './movies-card.component.scss'
})
export class MoviesCardComponent {

  @Input() movie: any;
  @Input() isTvShow: boolean = false;

  constructor(private router: Router){}

  imageUrl: string = environment.tmdb.imagesUrl;

  goToDetail($event: Event ,isTvShow: boolean, id: number) {
    $event.preventDefault()
    const mediaType = isTvShow ? 'tv' : 'movie';
    this.router.navigate([`/${mediaType}`, id]);
  }

}
