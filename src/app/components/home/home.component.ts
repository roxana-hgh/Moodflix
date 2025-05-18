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
  nowPlayingMovies: any[] = [];
  nowPlayingTvShows: any[] = [];
  TopRatedMovies: any[] = [];
  TopRatedTvShows: any[] = [];
  

  ngOnInit(): void {
    this.getTrendingMovies();
    this.getpTrendingTv();
    this.getNowPlayingMovies();
    this.getNowPlayingTvShows();
    this.getTopRatedMovies();
    this.getTopRatedTvShows();
  }

  getTrendingMovies() {
    this.moviesServices.getTrendingMovies().subscribe(
      (response) => {
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
  
        this.TrendingTvShows = response.results;
      },
      (error) => {
        console.error('Error fetching trending shows:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }
  getNowPlayingMovies() {
    this.moviesServices.getNowPlayingMovies().subscribe(
      (response) => {
        this.nowPlayingMovies = response.results;
      },
      (error) => {
        console.error('Error fetching now playing movies:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }
  getNowPlayingTvShows() {
    this.moviesServices.getNowPlayingTvShows().subscribe(
      (response) => {
        this.nowPlayingTvShows = response.results;
      },
      (error) => {
        console.error('Error fetching now playing shows:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }
  getTopRatedMovies() {
    this.moviesServices.getTopRatedMovies().subscribe(
      (response) => {
        this.TopRatedMovies = response.results;
      },
      (error) => {
        console.error('Error fetching top rated movies:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }
  getTopRatedTvShows() {
    this.moviesServices.getTopRatedTvShows().subscribe(
      (response) => {
        this.TopRatedTvShows = response.results;
      },
      (error) => {
        console.error('Error fetching top rated shows:', error);
        this.toastService.show({message: "An error occurred"})
      }
    );
  }

}
