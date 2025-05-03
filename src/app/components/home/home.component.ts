import { Component } from '@angular/core';
import { MoviesService } from '../../services/movies.service';
import { ToastsService } from '../../services/toasts.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private moviesServices: MoviesService,public toastService: ToastsService) {}
  TrendingMovies: any[] = [];
  TrendingTvShows: any[] = [];

  ngOnInit(): void {
    this.getTrendingMovies();
    this.getpTrendingTv();
  }

  getTrendingMovies() {
    this.moviesServices.getTrendingMovies().subscribe(
      (response) => {
        console.log(response);
        this.TrendingMovies = response.results;
      },
      (error) => {
        console.error('Error fetching trending movies:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }
  getpTrendingTv() {
    this.moviesServices.getTrendingTvShows().subscribe(
      (response) => {
        console.log(response);
        this.TrendingTvShows = response.results;
      },
      (error) => {
        console.error('Error fetching trending shows:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }

}
