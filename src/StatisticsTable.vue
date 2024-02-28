<script>
import { ref, onMounted } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from "@coreui/bootstrap-vue";



export default {
  setup() {
    const selectedProperty = ref("");
    const data = ref(null);
    const range = ref({ min: null, max: null });
    const properties = ref(["elevation", "q", "q_unc", "wat_temp"]);


    const fetchData = async () => {
  try {
    const response = await fetch("../src/assets/data/small_sites.json");
    return await response.json();
  } catch (error) {
    console.error("Error fetching JSON data:", error);
  }
};

      onMounted(async () => {
      data.value = await fetchData();
      setRange(properties.value[0]); 
    });



    // change data structure to array
    function extractPropertyData(selectedProperty) {
      let array = data.value.features.map(
      (feature) => feature.properties[selectedProperty]
      );

      return array;
    }

    function setRange(selectedProperty) {
     let values = extractPropertyData(selectedProperty);
     range.value.min = Math.floor(Math.min.apply(null, values));
     range.value.max = Math.ceil(Math.max.apply(null, values));
  }

    return {
      selectedProperty,
      data,
      range,
      properties,
      setRange,
      extractPropertyData,
    };
  },
};

</script>

<template>
  <div>
    <select
      class="form-select"
      aria-label="Default select example"
      v-model="selectedProperty"
      @change="setRange(selectedProperty),plotGraph(selectedProperty)"
    >
      <option disabled value="">Select Properties component</option>
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
    <CTable v-if="selectedProperty" class="table table-bordered">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col">Property</CTableHeaderCell>
          <CTableHeaderCell scope="col">Minimum</CTableHeaderCell>
          <CTableHeaderCell scope="col">Maximum</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableHeaderCell scope="row">{{ selectedProperty }}</CTableHeaderCell>
          <CTableDataCell>{{ range.min }}</CTableDataCell>
          <CTableDataCell>{{ range.max }}</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>

</template>
