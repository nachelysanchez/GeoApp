import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  constructor() { }

  loadGoogleMaps() : Promise<any>{
    const win = window as any;
    const gModule = win.google
    if(gModule && gModule.maps){
      return Promise.resolve(gModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key='+
        environment.GoogleMapsApiKey + '&libraries=marker,places&loading=async&callback=initGoogleMaps';
      script.async = true;
      script.defer = true;

      win.initGoogleMaps = () => {
        const loadedGoogleModule = win.google;
        if(loadedGoogleModule && loadedGoogleModule.maps){
          resolve(loadedGoogleModule.maps);
        }
        else{
          reject('Google Map SDK is not Available');
        }

        delete win.initGoogleMaps;
        document.body.removeChild(script);
      };
      document.body.appendChild(script);
    });
  }
}
