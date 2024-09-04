<script setup>
import { ref, watch, computed, defineProps } from 'vue';
import { useMapControlsStore } from "@/store/mapControls.js";
import { Map } from "maplibre-gl";
import * as turf from '@turf/turf';
import Plotly from 'plotly.js-dist';
import datapoints from "@/assets/data/heatflow_sample_data.json";
import { CTooltip } from '@coreui/bootstrap-vue';

const closestPointfeatures = ref(null);
const depths = ref([10, 20, 30, 40, 50]);
const lineChart = ref(null);

/**
* @param {position of the element in the depth array} index
*/

const getMaxDepth = (index) => {
  if (index < depths.value.length - 1) {
    return depths.value[index + 1] - 1;
  }
  return Infinity; 
};

/**
* @param {closest points' q values} q
*/

const TempCal = (q) => {
  const k = 0.5;
  const A = 0.01;
  const T0 = 20;
  let T = T0;

  return depths.value.map(Z => {
    T = T + ((q * Z / k) - (A * (Z * Z) / (2 * k)));
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
* @param {Point} p1
* @param {Point} p2
*/

function calculatedistance(p1, p2) {
  const point1 = turf.point(p1);
  const point2 = turf.point(p2);
  return turf.distance(point1, point2);
}

/**
* @param {array} data

*/

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
    title: '',
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

watch(() => depths.value, () => {
  if (closestPointfeatures.value) {
    const q = closestPointfeatures.value.properties.q;
    const temperatureData = TempCal(q);
    drawChart(temperatureData);
  }
}, { deep: true });

const props = defineProps({ map: Map });
const mapControls = useMapControlsStore();


/**
* @param {event object} e

*/
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
  const temperatureData = TempCal(q);
  drawChart(temperatureData);
});

props.map.on('draw.delete', () => {
  closestPointfeatures.value = null;
});

props.map.on('draw.update', () => {
});

const depthInputs = computed(() => {
  return depths.value.map((depth, index) => {
    return {
      value: depth,
      max: getMaxDepth(index),
      index
    };
  });
});

/**
* @param {position in the depth array} index
* @param {new value that will be assigned in the depth array} newValue

*/

function updateDepth(index, newValue) {
  if (index < depths.value.length - 1 && newValue >= depths.value[index + 1]) {
    depths.value[index] = depths.value[index + 1] - 1;
  } else {
    depths.value[index] = newValue;
  }
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
    <div v-for="depthInput in depthInputs" :key="depthInput.index">
      <label :for="'depth' + depthInput.index">Depth {{ depthInput.index + 1 }}:</label>
      <input
        :id="'depth' + depthInput.index"
        v-model.number="depths[depthInput.index]"
        :max="depthInput.max"
        type="number"
        min="0"
        @input="updateDepth(depthInput.index, $event.target.valueAsNumber)"
      />
    </div>
  </div>

  <div ref="lineChart" style="width: 100%; height: 500px;"></div>
</template>


