import { Component, DestroyRef, inject, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');

  private destoryRef = inject(DestroyRef);

 private placesService = inject(PlacesService);

  ngOnInit() {
    this.isFetching.set(true);
  const subscription =  this.placesService.loadAvailablePlaces()
      .subscribe({
        next: (res) => {
          console.log(res);

           console.log(res);
            this.places.set(res);

        },
        complete: () => {
          this.isFetching.set(false);
        },
        error: (error:Error) => {
          this.error.set(error.message);
        },
      });

      this.destoryRef.onDestroy(() => {
        subscription.unsubscribe();
      }
      );
  }


  onSelectPlace(selectedPlace: Place) {
   const subscription =  this.placesService.addPlaceToUserPlaces(selectedPlace).subscribe({
      next: (res) => {
        console.log(res);
      }
    });


      this.destoryRef.onDestroy(() => {
        subscription.unsubscribe();
      })


  }
}
