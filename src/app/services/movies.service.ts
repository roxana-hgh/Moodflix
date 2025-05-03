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
}
