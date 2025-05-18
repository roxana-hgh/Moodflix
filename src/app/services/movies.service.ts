import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastsService } from './toasts.service';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  baseUrl = environment.tmdb.baseUrl;
  constructor(private http: HttpClient, 
    public toastService: ToastsService
  ) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${environment.tmdb.token}`,
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    this.toastService.show({message: "An error occurred"})
    return throwError(error);
  }

  searchMovies(query: string, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}search/multi?query=${query}&language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getPopularMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}movie/popular?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTrendingMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}trending/movie/week?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTrendingTvShows(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}trending/tv/week?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getNowPlayingMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}movie/now_playing?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getNowPlayingTvShows(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}tv/on_the_air?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTopRatedMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}movie/top_rated?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTopRatedTvShows(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}tv/top_rated?language=en-US&page=${page}`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTvShowDetail(id: number): Observable<any> {
    const url = `${this.baseUrl}tv/${id}?append_to_response=credits`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTMovieDetail(id: number): Observable<any> {
    const url = `${this.baseUrl}movie/${id}?append_to_response=credits`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getSimilarMovies(id: number): Observable<any> {
    const url = `${this.baseUrl}movie/${id}/similar?language=en-US`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getSimilarTvShows(id: number): Observable<any> {
    const url = `${this.baseUrl}tv/${id}/similar?language=en-US`;
    return this.http.get(url, { headers: this.createHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
