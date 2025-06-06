import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
   private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:4000/places', 'Error fetching places');
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:4000/user-places', 'Error fetching user places')
      .pipe(
          tap({
            next: (places) => {
              this.userPlaces.set(places);
            },
            error: (error) => {
              console.error('Error loading user places:', error);
            }
          })
      );
  }

  addPlaceToUserPlaces(place: Place) {
    const  prevPlaces = this.userPlaces();
    if(!prevPlaces.some((p) => p.id === place.id)) {
    this.userPlaces.set([...prevPlaces, place]);
    }
    return  this.httpClient.put('http://localhost:4000/user-places' ,{
     placeId: place.id
    }).pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces); // Revert to previous state on error
        return throwError(() => new Error('Error adding place to user places: ' + error.message));
      })
    );
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(url: string , errorMessage: string) {
   return  this.httpClient
        .get<{places:Place[]}>(url, {
              // observe: 'response',
            // observe: 'events',

        })
        .pipe(
  map((resData) => resData.places) , catchError((error , obs) => throwError(()=> new Error(errorMessage))),
        )
  }
}
