<template>
  <div class="map-wrap">
    <a href="https://www.maptiler.com" class="watermark">
      <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/>
    </a>
    <div class="map" ref="mapContainer"></div>
    <div class="calculation-box">
      <p>Calculated Area:</p>
    <div id="calculated-area">{{ calculatedArea }}</div>
    </div>
  </div>
</template>

  
  
<script setup>
import { ref, onMounted, onUnmounted, shallowRef, markRaw } from 'vue';
import { Map, NavigationControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const mapContainer = shallowRef(null);
const map = shallowRef(null);
let draw = null;
const calculatedArea = ref('');

onMounted(() => {
  const apiKey = 'liis5nn4g1AoUjEq2xAB';
  const initialState = { lng: 75.46043946360717, lat: 17.90878778904566, zoom: 4 };


  map.value = markRaw(new Map({
    container: mapContainer.value,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom
  }));

  map.value.addControl(new NavigationControl(), 'top-right');
  
  const points = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [75.46043946360717, 10.90878778904566]
    },
    properties: {
      name: 'Point 1',
       q : 1,
       k : 2.5,
       A : 3,
       T0 :15
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [80.46043946360717, 15.90878778904566]
    },
    properties: {
      name: 'Point 2',
      q : 1.5,
       k : 2.5,
       A : 3.5,
       T0 :20
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [85.46043946360717, 15.90878778904566]
    },
    properties: {
      name: 'Point 3',
      q : 1.7,
       k : 3.5,
       A : 5,
       T0 :28
    }
  },
  
];

map.value.on('load', () => {
  map.value.addSource('points', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: points
    }
  });

map.value.addLayer({
    id: 'points',
    type: 'circle',
    source: 'points',
    paint: {
      'circle-radius': 8,
      'circle-color': '#ff0000'
    }
  });
});

  
  points.forEach(point => {
    map.value.on('click', 'points', (e) => {
      if (e.features[0].properties.name === point.properties.name) {
        TempCal(point.properties);
      }
    });
  });



const TempCal = (properties) => {

const depth = [10, 20, 30, 40, 50];
const q = properties.q; 
const k = properties.k; 
const A = properties.A; 
let T0 = properties.T0;

depth.forEach(Z => {
  let T = T0 + ((q * Z / k) - (A * (Z * Z) / (2 * k)));
  console.log('calTem and depth:',T+ 'C',Z +'m')
  T0=T;
});
};



  draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      
      trash: true,
      point: true,   
    
    },
  });

  map.value.addControl(draw);

  map.value.on('draw.create', event => {
    const pointCoordinates = event.features[0].geometry.coordinates;

  let nearestpoint = null;
  let minDistance = Infinity;

  points.forEach(point => {
    const coordinates = point.geometry.coordinates;
    const distance = calculatedistance(pointCoordinates,coordinates)
    if (distance < minDistance) {
      minDistance=distance;
      nearestpoint=coordinates;

    }
  });

  console.log('Nearest point:', nearestpoint);
});

// Function to calculate distance between two points
function calculatedistance(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
}

  map.value.on('draw.delete', updateArea);
  map.value.on('draw.update', updateArea);
});

onUnmounted(() => {
  map.value?.remove();
});

const updateArea = (e) => {
  const data = draw.getAll();
  if (data.features.length > 0) {
    const coordinates = [];
    data.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        // Add the coordinates of point features to the coordinates array
        coordinates.push(feature.geometry.coordinates);
      } 
    });

    // Log the coordinates array
    console.log(coordinates);

    // Calculate the area using the coordinates array
    const points = turf.points(coordinates);
    const area = turf.area(points);
    const roundedArea = Math.round(area * 100) / 100;
    calculatedArea.value = `${roundedArea.toFixed(2)} square meters`;
  } else {
    calculatedArea.value = '';
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
    right: 10px;
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
  