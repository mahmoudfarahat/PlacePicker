import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, tap } from 'rxjs';
import { ErrorService } from '../shared/shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorSerivce = inject(ErrorService); // Assuming you have an ErrorService for handling errors
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
        this.errorSerivce.showError('Error adding place to user places: ' + error.message);
        return throwError(() => new Error('Error adding place to user places: ' + error.message));
      })
    );
  }

  removeUserPlace(place: Place) {
      const  prevPlaces = this.userPlaces();
    if(prevPlaces.some((p) => p.id === place.id)) {
       this.userPlaces.set(prevPlaces.filter((p) => p.id !== place.id));
    }
return this.httpClient.delete('http://localhost:4000/user-places/' + place.id)
.pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces); // Revert to previous state on error
        this.errorSerivce.showError('Error deleting place to user places: ' + error.message);
        return throwError(() => new Error('Error deleting place to user places: ' + error.message));
      })
    );
  }

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
