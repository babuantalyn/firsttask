<template>
    <div class="map-wrap">
      <a href="https://www.maptiler.com" class="watermark">
        <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/>
      </a>
      <div class="map" ref="mapContainer"></div>
      <div class="calculation-box">
        <p>Calculated Area:</p>
        <div id="calculated-area"></div>
      </div>
    </div>
  </template>
  
  
  <script>
  import { Map, NavigationControl, Marker } from 'maplibre-gl';
  import MapboxDraw from '@mapbox/mapbox-gl-draw';
  import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
  import * as turf from '@turf/turf';
  import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
  
  export default {
    name: "Map",
    setup () {
      const mapContainer = shallowRef(null);
      const map = shallowRef(null);
      let draw = null;
  
      onMounted(() => {
        const apiKey = 'liis5nn4g1AoUjEq2xAB';
        const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };
  
        map.value = markRaw(new Map({
          container: mapContainer.value,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
          center: [initialState.lng, initialState.lat],
          zoom: initialState.zoom
        }));
  
        map.value.addControl(new NavigationControl(), 'top-right');
        new Marker({ color: "#FF0000" })
          .setLngLat([139.7525,35.6846])
          .addTo(map.value);
  
        draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
            point: true,   
            line_string: false,
          },
        });
        map.value.addControl(draw);
  
        // Event listeners for draw events
        map.value.on('draw.create', updateArea);
        map.value.on('draw.delete', updateArea);
        map.value.on('draw.update', updateArea);
      });
  
      onUnmounted(() => {
        map.value?.remove();
      });
  
      // Update the area calculation when a draw event occurs
      const updateArea = (e) => {
        const data = draw.getAll();
        const answer = document.getElementById('calculated-area');
        if (data.features.length > 0) {
          const area = turf.area(data);
          const roundedArea = Math.round(area * 100) / 100;
          answer.innerHTML = `<strong>Area:</strong> ${roundedArea.toFixed(2)} square meters`;
        } else {
          answer.innerHTML = '';
        }
      };
  
      return {
        map,
        mapContainer
      };
    }
  };
  </script>
  
  <style scoped>
  .map-wrap {
    position: relative;
    width: 100vw; 
    height: calc(100vh - 77px); 
  }
  
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .watermark {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 999;
  }
  .calculation-box {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
}

p {
  font-family: 'Open Sans';
  margin: 0;
  font-size: 14px;
}

#calculated-area {
  margin-top: 5px;
  font-size: 16px;
}
  </style>
  