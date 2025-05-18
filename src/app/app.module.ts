import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from './components/base/base.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { MoviesCarouselComponent } from './components/movies/movies-carousel/movies-carousel.component';
import { MoviesCardComponent } from './components/movies/movies-card/movies-card.component';
import { HttpClientModule } from '@angular/common/http';
import { ToastComponent } from './components/shared/toast/toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MoviesDetailsComponent } from './components/movies/movies-details/movies-details.component';
import { LoaderComponent } from './components/shared/loader/loader.component';


@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    HomeComponent,
    HeaderComponent,
    MoviesCarouselComponent,
    MoviesCardComponent,
    ToastComponent,
    MoviesDetailsComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BrowserAnimationsModule,
    CarouselModule,
    FormsModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
