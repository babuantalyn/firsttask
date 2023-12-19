<script>
import { ref, onMounted, watch } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css'
import Plotly from 'plotly.js-dist';

import {
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  
} from '@coreui/bootstrap-vue';

export default {
  components: {
    CTable,
    CTableHead,
    CTableBody,
    CTableHeaderCell,
    CTableRow,
    CTableDataCell,
  },

  setup() {
    const sites = ref([]);
    const selectedProperty = ref('');

    // Fetch JSON data asynchronously
    const fetchData = async () => {
      try {
        const response = await fetch('../src/assets/data/small_sites.json');
        const data = await response.json();
        sites.value = data.features || [];
        console.log('Fetched Data:', sites.value);
        extractElevations();
        extractq();
        extractq_unc();
        extractwat_temp();

      } catch (error) {
        console.error('Error fetching JSON data:', error);
      }
    };

    // Call fetchData on component mount
    onMounted(() => {
      fetchData();
    });

    // Extract of data
    const elevations = ref([]);
    const q = ref([]);
    const q_unc = ref([]);
    const wat_temp = ref([]);   


    const extractElevations = () => {
      elevations.value = sites.value.map(feature => feature.properties.elevation);
    }
    const extractq = () => {
      q.value = sites.value.map(feature => feature.properties.q);
    }
    const extractq_unc = () => {
      q_unc.value = sites.value.map(feature => feature.properties.q_unc);
    }
    const extractwat_temp = () => {
      wat_temp.value = sites.value.map(feature => feature.properties.wat_temp);
    }


  function findMinMax(arr) {

  const filteredArr = arr.filter(item => item !== null);

  if (filteredArr.length === 0) {
    return { min: null, max: null };
  }

  let min = filteredArr[0];
  let max = filteredArr[0];

  for (let i = 1; i < filteredArr.length; i++) {
    if (filteredArr[i] > max) {
      max = filteredArr[i];
    }
    if (filteredArr[i] < min) {
      min = filteredArr[i];
    }
  }

  return { min, max };
}


    const elevationMinMax = ref({ min: null, max: null });
    const qMinMax = ref({ min: null, max: null });
    const q_uncMinMax = ref({ min: null, max: null });
    const wat_tempMinMax = ref({ min: null, max: null });

    watch(selectedProperty, () => {
      if (selectedProperty.value === 'elevation') {
        elevationMinMax.value = findMinMax(elevations.value);
      } else if (selectedProperty.value === 'q') {
        qMinMax.value = findMinMax(q.value);
      } else if (selectedProperty.value === 'q_unc') {
        q_uncMinMax.value = findMinMax(q_unc.value);
      } else if (selectedProperty.value === 'wat_temp'){
        wat_tempMinMax.value = findMinMax(wat_temp.value);
      }
    });

  // Plotly logic
  const plotContainer = ref(null);
  
  watch(selectedProperty, () => {
    if (selectedProperty.value === 'q') {
      qMinMax.value = findMinMax(q.value);
      const trace = {
        x: q.value,
        type: 'histogram',
      };
      const data = [trace];
      Plotly.newPlot('myDiv', data);
    } else if (selectedProperty.value === 'q_unc') {
      
      q_uncMinMax.value = findMinMax(q_unc.value);
      const trace = {
        x: q_unc.value,
        type: 'histogram',
      };
      const data = [trace];
      Plotly.newPlot('myDiv', data);
    } else if (selectedProperty.value === 'wat_temp') {
      
      wat_tempMinMax.value = findMinMax(wat_temp.value);
      const trace = {
        x: wat_temp.value,
        type: 'histogram',
      };
      const data = [trace];
      Plotly.newPlot('myDiv', data);
    } else if (selectedProperty.value === 'elevation') {
      
      elevationMinMax.value = findMinMax(elevations.value);
      const trace = {
        x: elevations.value,
        type: 'histogram',
      };
      const data = [trace];
      Plotly.newPlot('myDiv', data);
    }

  });

    return {
      selectedProperty,
      elevationMinMax,
      qMinMax,
      q_uncMinMax,
      wat_tempMinMax,
      plotContainer,
    };
  },
};
   
</script>

<template>
  <div>   
    <select class="form-select" aria-label="Default select example" v-model="selectedProperty">
      <option disabled value="">Select Properties</option>
      <option value="elevation">elevation</option>
      <option value="q">q</option>
      <option value="q_unc">q_unc</option>
      <option value="wat_temp">wat_temp</option>
    </select>

    <p>Selected Property: {{ selectedProperty }}</p>

    <div v-if="selectedProperty === 'elevation'">
      <p>Maximum Elevation: {{ elevationMinMax.max }}</p>
      <p>Minimum Elevation: {{ elevationMinMax.min }}</p>
    </div>

    <div v-if="selectedProperty === 'q'">
      <p>Maximum q: {{ qMinMax.max }}</p>
      <p>Minimum q: {{ qMinMax.min }}</p>
    </div>

    <div v-if="selectedProperty === 'q_unc'">
      <p>Maximum q_unc: {{ q_uncMinMax.max }}</p>
      <p>Minimum q_unc: {{ q_uncMinMax.min }}</p>
    </div>

    <div v-if="selectedProperty === 'wat_temp'">
      <p>Maximum wat_temp: {{ wat_tempMinMax.max }}</p>
      <p>Minimum wat_temp: {{ wat_tempMinMax.min }}</p>
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
        <CTableRow v-if="selectedProperty === 'elevation'">
          <CTableHeaderCell scope="row">Elevation</CTableHeaderCell>
          <CTableDataCell>{{ elevationMinMax.min }}</CTableDataCell>
          <CTableDataCell>{{ elevationMinMax.max }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-else-if="selectedProperty === 'q'">
          <CTableHeaderCell scope="row">q</CTableHeaderCell>
          <CTableDataCell>{{ qMinMax.min }}</CTableDataCell>
          <CTableDataCell>{{ qMinMax.max }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-else-if="selectedProperty === 'q_unc'">
          <CTableHeaderCell scope="row">q_unc</CTableHeaderCell>
          <CTableDataCell>{{ q_uncMinMax.min }}</CTableDataCell>
          <CTableDataCell>{{ q_uncMinMax.max }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-else-if="selectedProperty === 'wat_temp'">
          <CTableHeaderCell scope="row">wat_temp</CTableHeaderCell>
          <CTableDataCell>{{ wat_tempMinMax.min }}</CTableDataCell>
          <CTableDataCell>{{ wat_tempMinMax.max }}</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>

  <div id="myDiv" style="width: 600px; height: 400px;"></div>
  
</template>
