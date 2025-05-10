import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoviesService } from '../../../services/movies.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movies-details',
  templateUrl: './movies-details.component.html',
  styleUrl: './movies-details.component.scss'
})
export class MoviesDetailsComponent implements OnInit {
  movie: any;
  mediaType: string = 'movie';
  id: number = 0;
  imageUrl: string = environment.tmdb.imagesUrl;
  isTvShow: boolean = false;
  constructor(private route: ActivatedRoute, private moviesService: MoviesService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.mediaType = params['mediaType'];
      this.id = +params['id'];
      this.isTvShow = this.mediaType === 'tv';
      this.getMovieDetails(this.mediaType, this.id);
    });
  }

  getMovieDetails(mediaType: string, id: number): void {
    if (mediaType === 'movie') {
      this.moviesService.getTMovieDetail(id).subscribe(data => {
        this.movie = data;
      });
    } else if (mediaType === 'tv') {
      this.moviesService.getTvShowDetail(id).subscribe(data => {
        this.movie = data;
      });
    }
    console.log(this.movie);
    
  }

}
