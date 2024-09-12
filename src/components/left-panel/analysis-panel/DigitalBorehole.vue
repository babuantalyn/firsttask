<script setup>
import { ref, watch, computed, defineProps } from 'vue';
import { useMapControlsStore } from "@/store/mapControls.js";
import { Map } from "maplibre-gl";
import * as turf from '@turf/turf';
import Plotly from 'plotly.js-dist';
import datapoints from "@/assets/data/heatflow_sample_data.json";
import { CTooltip } from '@coreui/bootstrap-vue';

import { useDepthStore } from '@/store/depthstore'; 
const depthStore = useDepthStore();  

const closestPointfeatures = ref(null);
const K = ref([2.5, 2.6, 2.7, 2.8, 2.9]);  
const A = ref([0.02, 0.03, 0.04, 0.05, 0.06]);  
const lineChart = ref(null);

const depthInputs = computed(() =>
  depthStore.depths.map((depth, index) => ({
    index,
    value: depth,
    max: index < depthStore.depths.length - 1 ? depthStore.depths[index + 1] : Infinity,
    min: index > 0 ? depthStore.depths[index - 1] : 0,
  }))
);

function handleDepthChange(index, newValue) {
  depthStore.updateDepth(index, newValue);
}


/**
* @param {number} index
* @return {number } depths
* @discritpion {position of the element in the depth array}
*/

const getMaxDepth = (index) => {
  if (index < depthStore.depths.length - 1) {
    return depthStore.depths[index + 1] - 1;
  }
  return Infinity; 
};

/**
* @param {number} q
* @return {number} T, Z
* @discritpion {closest points' q values} q
* @param {number} K
* @return {number} T, Z
* @discritpion {conductivity set by user} K
* @param {number} A
* @return {number} T,Z
* @discritpion {heat production set by user} A
*/

const TempCal = (q, K, A) => {
  const T0 = 20;
  let T = T0;

  return depthStore.depths.map((Z, index) => {
    const k = K[index];  
    const a = A[index];  
    T = T + ((q * Z / k) - (a * (Z * Z) / (2 * k)));  
    return { temperature: T, depth: Z };
  });
};

function drawPoint() {
  mapControls.mapboxDraw.changeMode('draw_point');
}

function deletePoint() {
  mapControls.mapboxDraw.trash();
}


/**
* @param {number} P1, P2
* @return {number} distance 
* @discritpion {coordinates of the point} 

*/


function calculatedistance(p1, p2) {
  const point1 = turf.point(p1);
  const point2 = turf.point(p2);
  return turf.distance(point1, point2);
}




function drawChart(data) {
  const temperature = data.map(d => d.temperature);
  const depth = data.map(d => d.depth);

  const plotData = {
    x: temperature,
    y: depth,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'blue' },
    textposition: 'top center',
    hoverinfo: 'text+x+y',
  };

  const shapes = depth.map(d => ({
    type: 'line',
    x0: Math.min(...temperature) - 5,
    x1: Math.max(...temperature) + 5,
    y0: d,
    y1: d,
    line: {
      color: 'brown',
      width: 2,
      dash: 'dot',
    }
  }));

  const layout = {
    title: 'Temperature vs Depth',
    xaxis: {
      title: 'Temperature (°C)',
      side: 'top',
      range: [Math.min(...temperature) - 5, Math.max(...temperature) + 5],
    },
    yaxis: {
      title: 'Depth (m)',
      range: [Math.max(...depth) + 10, 0],
    },
    shapes: shapes,
  };

  Plotly.newPlot(lineChart.value, [plotData], layout);
}

watch([depthStore.depths, K, A], () => {
  if (closestPointfeatures.value) {
    const q = closestPointfeatures.value.properties.q;
    const temperatureData = TempCal(q, K.value, A.value);
    drawChart(temperatureData);
  }
}, { deep: true });

const props = defineProps({ map: Map });
const mapControls = useMapControlsStore();

props.map.on('draw.create', (e) => {
  const pointCoordinates = e.features[0].geometry.coordinates;

  let nearestPoint = null;
  let minDistance = Infinity;

  datapoints.features.forEach(feature => {
    const coordinates = feature.geometry.coordinates;
    const distance = calculatedistance(pointCoordinates, coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = feature;
    }
  });

  closestPointfeatures.value = nearestPoint;
  const q = closestPointfeatures.value.properties.q;
  const temperatureData = TempCal(q, K.value, A.value);
  drawChart(temperatureData);
});

props.map.on('draw.delete', () => {
  closestPointfeatures.value = null;
  Plotly.purge(lineChart.value);  
});

function updateK(index, newValue) {
  K.value[index] = newValue;
}

function updateA(index, newValue) {
  A.value[index] = newValue;
}
</script>


<template>
  <CTooltip content="Draw Point" placement="bottom">
    <template #toggler="{ on }">
      <button id="draw-point-btn" class="btn btn-primary mx-1" v-on="on" @click="drawPoint()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
          <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
          <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        </svg>
      </button>
    </template>
  </CTooltip>

  <CTooltip content="Delete selected Point" placement="bottom">
    <template #toggler="{ on }">
      <button id="delete-point-btn" class="btn btn-primary mx-1" v-on="on" @click="deletePoint()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </button>
    </template>
  </CTooltip>

  <div v-if="closestPointfeatures">
    <h3>Nearest Point Coordinates:</h3>
    <p>Longitude: {{ closestPointfeatures.geometry.coordinates[0] }}</p>
    <p>Latitude: {{ closestPointfeatures.geometry.coordinates[1] }}</p>
    <h3>Properties:</h3>
    <p>ID: {{ closestPointfeatures.properties.id }}</p>
    <p>Correct HP Flag: {{ closestPointfeatures.properties.corr_HP_flag }}</p>
    <p>Created: {{ closestPointfeatures.properties.created }}</p>
    <p>Environment: {{ closestPointfeatures.properties.environment }}</p>
    <p>Exploration Method: {{ closestPointfeatures.properties.explo_method }}</p>
    <p>Exploration Purpose: {{ closestPointfeatures.properties.explo_purpose }}</p>
    <p>Q: {{ closestPointfeatures.properties.q }}</p>
    <p>Q Uncertainty: {{ closestPointfeatures.properties.q_uncertainty }}</p>
    <p>Total Depth MD: {{ closestPointfeatures.properties.total_depth_MD }}</p>
    <p>Total Depth TVD: {{ closestPointfeatures.properties.total_depth_TVD }}</p>
    <p>UUID: {{ closestPointfeatures.properties.uuid }}</p>
  </div>

  
  <div>
    <div v-for="(depthInput, index) in depthInputs" :key="index">
      <label :for="'depth' + index">Depth {{ index + 1 }}:</label>
      <input
        :id="'depth' + index"
        :value="depthInput.value"
        :max="depthInput.max"
        :min="depthInput.min"
        type="number"
        min="0"
        @input="handleDepthChange(index, $event.target.valueAsNumber)"
      />
    </div>
  </div>

  
  <div>
    <div v-for="(k, index) in K" :key="index">
      <label :for="'K' + index">K {{ index + 1 }}:</label>
      <input
        :id="'K' + index"
        v-model.number="K[index]"
        type="number"
        min="0"
        @input="updateK(index, $event.target.valueAsNumber)"
      />
    </div>
  </div>

  
  <div>
    <div v-for="(a, index) in A" :key="index">
      <label :for="'A' + index">A {{ index + 1 }}:</label>
      <input
        :id="'A' + index"
        v-model.number="A[index]"
        type="number"
        min="0"
        @input="updateA(index, $event.target.valueAsNumber)"
      />
    </div>
  </div>

  <div ref="lineChart" style="width: 100%; height: 500px;"></div>
</template>
