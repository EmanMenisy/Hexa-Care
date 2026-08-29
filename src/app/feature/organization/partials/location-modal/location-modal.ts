import { Component, effect, input, output, signal } from '@angular/core';
import { Localization } from '../../../../core/services/localization/localization';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const iconUrl = '/images/marker_location.svg';
const iconDefault = L.icon({
  iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

// TODO(Mohamed): move to a shared model file once used across features
export interface LocationPoint {
  center: { latitude: number; longitude: number };
  radiusInMeters: number;
  marker?: L.Marker;
  circle?: L.Circle;
}
@Component({
  selector: 'app-location-modal',
  imports: [
    CommonModule,
    DialogModule,
    ButtonComponent,
    TranslatePipe,
    InputTextComponent,
    FormsModule
  ],
  templateUrl: './location-modal.html',
  styleUrl: './location-modal.scss',
})
export class LocationModal {
  /* -------------------- inputs / outputs -------------------- */
  visible = input<boolean>(false);
  data = input<any>(null);
  close = output<boolean>();
  saveLocation = output<any>();

  /* -------------------- state (signals) -------------------- */
  locations = signal<LocationPoint[]>([]);
  selectedLocation = signal<LocationPoint | null>(null);
  searchQuery = signal<string>('');

  map!: L.Map;

  constructor(private readonly localizationService:Localization) {
    effect(() => {
      if (this.visible()) {
        this.locations.set([]);
        this.selectedLocation.set(null);
        setTimeout(() => {
          this.initMap();
        }, 1000);
      }
    });
  }

  /* -------------------- init map -------------------- */
  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    let initialLat = 30.0444;
    let initialLng = 31.2357;

    const data = this.data();
    if (data && data.length > 0) {
      const firstLoc = data[0].center;
      initialLat = firstLoc.latitude;
      initialLng = firstLoc.longitude;
      this.setupMapLayout(initialLat, initialLng);
    } else {
      this.getCurrentLocation((lat, lng) => {
        this.setupMapLayout(lat, lng);
      });
    }
  }

  /* -------------------- clear any existing point (marker + circle + state) -------------------- */
  private clearExistingLocation(): void {
    const existing = this.locations();
    existing.forEach((loc) => {
      if (loc.marker) {
        this.map.removeLayer(loc.marker);
      }
      if (loc.circle) {
        this.map.removeLayer(loc.circle);
      }
    });
    this.locations.set([]);
    this.selectedLocation.set(null);
  }

  /* -------------------- add new location (replaces any existing single point) -------------------- */
  addNewLocation(lat: number, lng: number): void {
    const existing = this.locations()[0];
    if (existing && existing.center.latitude === lat && existing.center.longitude === lng) {
      this.selectedLocation.set(existing);
      return;
    }

    this.clearExistingLocation();

    const marker = L.marker([lat, lng]).addTo(this.map);
    const circle = L.circle([lat, lng], {
      radius: 50,
      color: '#3388ff'
    }).addTo(this.map);

    const newLocation: LocationPoint = {
      center: { latitude: lat, longitude: lng },
      radiusInMeters: 50,
      marker,
      circle
    };

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      this.highlightSelection(newLocation);
    });

    this.locations.set([newLocation]);
    this.highlightSelection(newLocation);
  }

  /* -------------------- update radius -------------------- */
  updateRadius(event: any): void {
    const selected = this.selectedLocation();
    if (event === null || event === undefined || !selected) return;

    selected.radiusInMeters = event;
    if (selected.radiusInMeters >= 0) {
      selected.circle?.setRadius(selected.radiusInMeters);
    }
    // new reference so the template (radius input) reflects the change under OnPush
    this.selectedLocation.set({ ...selected });
    this.locations.set([{ ...selected }]);
  }

  /* -------------------- search location -------------------- */
  // searchLocation(): void {
  //   const query = this.searchQuery().trim();
  //   if (!query) return;

  //   this.shiftsService.searchOnMap(query).subscribe({
  //     next: (results) => {
  //       if (results && results.length > 0) {
  //         const firstResult = results[0];
  //         const lat = parseFloat(firstResult.lat);
  //         const lon = parseFloat(firstResult.lon);
  //         this.map.setView([lat, lon], 16);
  //         this.addNewLocation(lat, lon);
  //         this.searchQuery.set('');
  //       }
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   });
  // }

  /* -------------------- remove selected location -------------------- */
  removeLocation(location: LocationPoint | null): void {
    if (!location) return;

    if (location.marker) {
      this.map.removeLayer(location.marker);
    }
    if (location.circle) {
      this.map.removeLayer(location.circle);
    }

    this.locations.update((list) => list.filter((loc) => loc !== location));

    if (this.selectedLocation() === location) {
      this.selectedLocation.set(null);
    }
  }

  /* -------------------- highlight selected location with green -------------------- */
  highlightSelection(location: LocationPoint): void {
    this.locations().forEach((loc) => {
      loc.circle?.setStyle({ color: '#3388ff', fillColor: '#3388ff' });
    });
    this.selectedLocation.set(location);
    location.circle?.setStyle({ color: '#28a745', fillColor: '#28a745' });
  }

  /* -------------------- add existing location coming from `data` input -------------------- */
  addExistingLocation(loc: any): void {
    this.clearExistingLocation();

    const marker = L.marker([loc.center.latitude, loc.center.longitude]).addTo(this.map);
    const circle = L.circle([loc.center.latitude, loc.center.longitude], {
      radius: loc.radiusInMeters || 50,
      color: '#3388ff'
    }).addTo(this.map);

    const newLocation: LocationPoint = {
      center: { ...loc.center },
      radiusInMeters: loc.radiusInMeters || 50,
      marker,
      circle
    };

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      this.highlightSelection(newLocation);
    });

    this.locations.set([newLocation]);
  }

  /* -------------------- save -------------------- */
  saveData(): void {
    const dataToSave = this.locations().map((loc) => ({
      center: {
        latitude: loc.center.latitude,
        longitude: loc.center.longitude
      },
      radiusInMeters: loc.radiusInMeters
    }));
    // هترجع array فيها عنصر واحد بالظبط (أو فاضية)
    this.saveLocation.emit(dataToSave);
  }

  /* -------------------- close -------------------- */
  closeModal(): void {
    this.close.emit(false);
  }

  /* -------------------- focus on a point from the side list -------------------- */
  focusOnLocation(location: LocationPoint): void {
    this.highlightSelection(location);
    this.map.flyTo([location.center.latitude, location.center.longitude], 16, {
      animate: true,
      duration: 1
    });
  }

  /* -------------------- current location via navigator.geolocation -------------------- */
  private getCurrentLocation(callback: (lat: number, lng: number) => void): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          callback(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location', error);
          callback(30.0444, 31.2357);
        },
        { enableHighAccuracy: true }
      );
    } else {
      callback(30.0444, 31.2357);
    }
  }

  /* -------------------- setup map -------------------- */
  private setupMapLayout(lat: number, lng: number): void {
    this.map = L.map('map', {
      zoomControl: false
    }).setView([lat, lng], 15);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider
    });
    this.map.addControl(searchControl);

    const data = this.data();
    if (data && data.length) {
      this.addExistingLocation(data[0]);
    }

    this.map.on('geosearch/showlocation', (result: any) => {
      this.addNewLocation(result.location.y, result.location.x);
    });
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addNewLocation(e.latlng.lat, e.latlng.lng);
    });
  }
}
