<script setup>

import { ref, onMounted } from "vue";
import Plotly from "plotly.js-dist";
import { useStatisticsStore } from '../src/stores/StatisticsStore';

const statisticsStore = useStatisticsStore();
console.log(statisticsStore.nameOfStatisticStore)

import StatisticsTable from './StatisticsTable.vue';
import Downloadbutton from "./Downloadbutton.vue";
import StatisticsGraph from "./StatisticsGraph.vue";

const selectedProperty = ref("");
const data = ref(null);
const range = ref({ min: null, max: null });
const properties = ref(["elevation", "q", "q_unc", "wat_temp"]);

// Fetch JSON data asynchronously
const fetchData = async () => {
  try {
    const response = await fetch("../src/assets/data/small_sites.json");
    return await response.json();
  } catch (error) {
    console.error("Error fetching JSON data:", error);
  }
};

// Call fetchData on component mount
onMounted(async () => {
  data.value = await fetchData();
  properties.value.forEach(property => setRange(property));
});

// Extract of data
function plotGraph(selectedProperty) {
  let dataArr = extractPropertyData(selectedProperty);
  const trace = {
    x: dataArr,
    type: "histogram",
  };
  const data = [trace];
  Plotly.newPlot("myDiv", data);
}

// change data structure to array
function extractPropertyData(selectedProperty) {
  let array = data.value.features.map(
    (feature) => feature.properties[selectedProperty]
  );

  return array;
}


// get and set min and max of selected property
function setRange(selectedProperty) {
  let values = extractPropertyData(selectedProperty);
  range.value.min = Math.floor(Math.min.apply(null, values));
  range.value.max = Math.ceil(Math.max.apply(null, values));

  // Update the max and min values in the Pinia store (statisticsStore)
  statisticsStore.maxValues[selectedProperty] = range.value.max;
  statisticsStore.minValues[selectedProperty] = range.value.min;

  // Update the selected property in the Pinia store
  statisticsStore.selectedPropertyName = selectedProperty;
}


</script>

<template>
  <div>
    <select
      class="form-select"
      aria-label="Default select example"
      v-model="selectedProperty"
      @change="setRange(selectedProperty), plotGraph(selectedProperty)"
    >
      <option disabled value="">Select Properties</option>
      <option v-for="property in properties" :key="property">
        {{ property }}
      </option>
    </select>

    <p>Selected Property: {{ selectedProperty }}</p>

    <div>
      <p v-if="selectedProperty">Maximum {{ selectedProperty }}: {{ range.max }}</p>
      <p v-if="selectedProperty">Minimum {{ selectedProperty }}: {{ range.min }}</p>
    </div>
  </div>


  
  
  <div>
      <p>pinia Selected Property: {{ statisticsStore.selectedPropertyName }}</p>
      <p>pinia Maximum {{ statisticsStore.selectedPropertyName }}: {{ statisticsStore.maxPropertyValue }}</p>
      <p>pinia Minimum {{ statisticsStore.selectedPropertyName }}: {{ statisticsStore.minPropertyValue }}</p>
  </div>

<button @click="downloadPlotAsPNG">pinia Download Plot as PNG</button>

<div id="myDiv"></div>
<img :src="statisticsStore.plotImageUrl" alt="Generated Plot" v-if="statisticsStore.plotImageUrl">

<StatisticsTable/>
<Downloadbutton/>
<StatisticsGraph/>
  </template>
