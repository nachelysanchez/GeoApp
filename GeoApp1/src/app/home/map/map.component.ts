import { Component, OnInit, inject, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent  implements OnInit {

  @ViewChild('map', {static: true}) mapElementRef!: ElementRef;
  googleMaps: any;
  source: any = {lat: 28.704060, lng: 77.102493};
  dest: any = {lat: 28.735517, lng: 77.102090};
  map: any;
  directionsService: any;
  directionsDisplay: any;

  source_marker: any;
  destination_marker: any;
  intersectionObserver: any;
  AdvancedMarkerElement: any;

  private maps = inject(GoogleMapsService);
  private renderer = inject(Renderer2);
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.loadMap();

    this.intersectionObserver = new IntersectionObserver((entries) => {
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('drop');
          this.intersectionObserver.unobserve(entry.target);
        }
      }
    });
  }

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

      const sourceIconUrl = 'assets/imgs/Car.png';
      const destinationIconUrl = 'assets/imgs/Pin.png';

      const source_position = new googleMaps.LatLng(
        this.source.lat,
        this.source.lng
      );
      const destination_position = new googleMaps.LatLng(
        this.dest.lat,
        this.dest.lng
      );

      await this.addMarker(
        source_position,
        sourceIconUrl,
        true
      );

      await this.addMarker(
        destination_position,
        destinationIconUrl
      );

      this.directionsService = new googleMaps.DirectionsService();
      this.directionsDisplay = new googleMaps.DirectionsRenderer({
        map: map
      });

      this.directionsDisplay.setOptions({
        polylineOptions:{
          strokeWeight: 4,
          strokeOpacity: 1,
          strokeColor: 'red'
        },
        suppressMarkers: true
      });

     await this.drawRoute();

      this.map.setCenter(source_position);
      this.renderer.addClass(mapEl, 'visible');
    }
    catch(e){
      console.log(e);
    }
  }

  async addMarker(location:any, imageUrl : string, isSource = false){
    try{
      const markerIcon = document.createElement('img');
      markerIcon.src = imageUrl;
      markerIcon.height = 50;
      markerIcon.width = 50;

      const AdvancedMarkerElement = this.AdvancedMarkerElement;
      console.log(AdvancedMarkerElement);

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: location,
        content: markerIcon
      });

      const content = marker.content;
      content.style.opacity = '0';
      content.addEventListener('animationend', (event: any) => {
        content.classList.remove('drop');
        content.style.opacity = '1';
      });

      this.intersectionObserver.observe(content);

      if (isSource){
        this.source_marker = marker;
      }
      return marker;
    }catch(e){
      throw e;
    }
  }

 drawRoute(){
    this.directionsService.route(
      {
        origin : this.source,
        destination: this.dest,
        travelMode : 'DRIVING',
        provideRouteAlternatives: true
      },
      (response: any, status: any) => {
        if(status === 'OK'){
          this.directionsDisplay.setDirections(response);
          console.log('responde: ', response);

          const route = response.routes[0].legs[0];
          const steps = route.steps;
          const positions :any[] = [];

          steps.array.forEach((element : any) => {
            const path = element.path;
            path.array.forEach((element: any) => {
              positions.push({lat: element.lat(), lng: element.lng()});
            });
          });

          this.animateMarkerAlongRoute(positions);
        }else{
          console.log(status);
        }
      },

    );
  }

  animateMarkerAlongRoute(positions : any[]){
    let index = 0;
    const totalPositions = positions.length;
    const stepcount = 20;
    const segment = Math.floor(totalPositions / stepcount);
    const interval = 500;

    const animate = () => {
      if (index < totalPositions - 1){
        const nextPosition = positions[index];

        this.changeMarkerPosition(nextPosition);
        index += segment;

        setTimeout(() => {
          requestAnimationFrame(animate);
        }, interval);
      }
      else{
        this.changeMarkerPosition(this.dest);
      }
    };

    requestAnimationFrame(animate);
  }

  changeMarkerPosition(data? : any){
    const newPosition = {lat: data?.lat, lng: data?.lng};
    this.animateMarker(this.source_marker, newPosition);
  }

  animateMarker(marker: any, newPosition: any){
    let googleMaps = this.googleMaps;

    const oldPosition = marker.position;
    const duration = 2000;
    const frameRate = 60;
    const frames = duration / (900 / frameRate);
    const deltaLat = (newPosition.lat - oldPosition.lat) / frames;
    const deltaLng = (newPosition.lng - oldPosition.lng) / frames;

    let frame = 0;
    const animate = () => {
      if(frame < frames){
        const lat = oldPosition.lat + deltaLat * frame;
        const lng = oldPosition.lng + deltaLng * frame;
        
        marker.position = new googleMaps.LatLng(lat, lng);
        frame++;
        requestAnimationFrame(animate);
      }
      else{
        marker.position = newPosition;
        this.source_marker = marker;
      }
    };
    animate();
  }
}
