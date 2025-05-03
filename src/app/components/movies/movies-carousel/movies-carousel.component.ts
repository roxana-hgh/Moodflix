import { Component, Input } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-movies-carousel',
  templateUrl: './movies-carousel.component.html',
  styleUrl: './movies-carousel.component.scss'
})
export class MoviesCarouselComponent {
@Input() movies: any[] = [];
@Input() listType: string = 'movie';



carouselOptions: OwlOptions = {
  loop: false,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: false,
  dots: false,
  navSpeed: 700,
  navText: ['<i class="bi bi-chevron-left"></i>', '<i class="bi bi-chevron-right"></i>'],
  responsive: {
    0: {
      items: 2
    },
    576: {
      items: 3
    },
    768: {
      items: 4
    },
    992: {
      items: 6
    },
  
  },
  nav: true,
  margin: 10,
  autoWidth: false,
  center: false,
  rewind: false
};


}
