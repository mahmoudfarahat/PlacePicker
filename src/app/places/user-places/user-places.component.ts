import { Place } from './../place.model';
import { PlacesService } from './../places.service';
import { Component, DestroyRef, inject, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent {

   isFetching = signal(false);
  error = signal('');

  private destoryRef = inject(DestroyRef);

 private placesService = inject(PlacesService);
places = this.placesService.loadedUserPlaces;

   ngOnInit() {
      this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({

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

    onRemoveUserPlace(place: Place) {
    const subscription =   this.placesService.removeUserPlace(place).subscribe();

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
