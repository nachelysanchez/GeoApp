import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent  implements OnInit {


  @ViewChild('map', {static: true}) mapElementRef!: ElementRef;
  googleMaps: any;
  source: any = {lat: 28.704060, lng: 77.102493};
  dest: any = {lat: 28.535517, lng: 77.391029};
  map: any;
  directionsService: any;
  directionsDisplay: any;

  source_marker: any;
  destination_marker: any;
  intersectionObserver: any;
  AdvancedMarkerElement: any;

  private maps = inject(GoogleMapsService);

  constructor() { }

  ngOnInit() {}

  async loadMap(){
    try{
      let googleMaps: any = await this.maps.loadGoogleMaps();
      this.googleMaps = googleMaps;

      const mapEl = this.mapElementRef.nativeElement;

      const { Map } = await googleMaps.importLibrary('maps');

      const {AdvancedMarkerElement} = await googleMaps.importLibrary('marker');
      this.AdvancedMarkerElement = AdvancedMarkerElement;

      console.log(this.AdvancedMarkerElement);

      const map = new Map(mapEl, {
        center: {lat: this.source.lat, lng: this.source.lng},
        disableDefaultUI: true,
        zoom: 13,
        mapId: 'live_track'
      });

      this.map = map;

      const sourceIconUrl = 'assets/imgs/car.png';
      const destinationIconUrl = 'assets/imgs/pin.png';

      const source_position = new googleMaps.LatLng(
        this.source.lat,
        this.source.lng
      );
      const destination_position = new googleMaps.LatLng(
        this.dest.lat,
        this.dest.lng
      );
    }
    catch(e){
      console.log(e)
    }
  }

}
