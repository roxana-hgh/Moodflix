import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movies-card',
  templateUrl: './movies-card.component.html',
  styleUrl: './movies-card.component.scss'
})
export class MoviesCardComponent {

  @Input() movie: any;
  @Input() isTvShow: boolean = false;

  imageUrl: string = environment.tmdb.imagesUrl;

}
