<script setup>
import { ref, onMounted } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import Plotly from "plotly.js-dist";
import { useStatisticsStore } from '../src/stores/StatisticsStore';

const statisticsStore = useStatisticsStore();
console.log(statisticsStore.nameOfStatisticStore)


import {
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from "@coreui/bootstrap-vue";

const sites = ref([]);
const selectedProperty = ref("");
const data = ref(null);
const range = ref({ min: null, max: null });

function handleClick()  {
       

        // Convert JSON object to a string
        const jsonString = JSON.stringify(data.value, null, 2);

        // Create a Blob with the JSON content
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create a link element
        const link = document.createElement('a');

        // Set the download attribute and create an object URL
        link.download = 'small_sites.json';
        link.href = window.URL.createObjectURL(blob);

        // Append the link to the body and click it programmatically
        document.body.appendChild(link);
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
        
}


// notes
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
  
  statisticsStore.maxValues[selectedProperty] = range.value.max;
  statisticsStore.minValues[selectedProperty] = range.value.min;

  statisticsStore.selectedPropertyName = selectedProperty;
}

function downloadPlotAsPNG() {
  // Use Plotly's toImage function to generate a base64 PNG image
  Plotly.toImage("myDiv", { format: "png", height: 600, width: 800 })
    .then(function (url) {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "plot.png"; // Specify the file name
      statisticsStore.plotImageUrl = url;
      // Append the link to the body and click it programmatically
      document.body.appendChild(link);
      link.click();

      // Remove the link from the body
      document.body.removeChild(link);
    })
    .catch(function (err) {
      console.error("Error downloading plot:", err);
    });
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
      <p>Maximum {{ selectedProperty }}: {{ range.max }}</p>
      <p>Minimum {{ selectedProperty }}: {{ range.min }}</p>
    </div>
  </div>

  <div>
    <CTable v-if="selectedProperty">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col">Property</CTableHeaderCell>
          <CTableHeaderCell scope="col">Minimum</CTableHeaderCell>
          <CTableHeaderCell scope="col">Maximum</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableHeaderCell scope="row">{{ selectedProperty}}</CTableHeaderCell>
          <CTableDataCell>{{ range.min }}</CTableDataCell>
          <CTableDataCell>{{ range.max }}</CTableDataCell>

        </CTableRow>
      </CTableBody>
    </CTable>
  </div>

   <div id="myDiv" style="width: 600px; height: 400px;"></div>
  <button @click="handleClick">Download</button>
  
  <div>
      <p>pinia Selected Property: {{ statisticsStore.selectedPropertyName }}</p>
      <p>pinia Maximum {{ statisticsStore.selectedPropertyName }}: {{ statisticsStore.maxPropertyValue }}</p>
      <p>pinia Minimum {{ statisticsStore.selectedPropertyName }}: {{ statisticsStore.minPropertyValue }}</p>
  </div>

<button @click="downloadPlotAsPNG">pinia Download Plot as PNG</button>

<div id="myDiv"></div>
<img :src="statisticsStore.plotImageUrl" alt="Generated Plot" v-if="statisticsStore.plotImageUrl">

  </template>
