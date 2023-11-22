<script>
import { ref, onMounted, watch } from 'vue';

export default {
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
      } catch (error) {
        console.error('Error fetching JSON data:', error);
      }
    };

    // Call fetchData on component mount
    onMounted(() => {
      fetchData();
    });

    // Extract only elevation data
    const elevations = ref([]);

    // Maximum and minimum elevations
    const maxElevation = ref(null);
    const minElevation = ref(null);

    const extractElevations = () => {
      elevations.value = sites.value.map(feature => feature.properties.elevation);

      if (selectedProperty.value === 'elevation') {
        if (elevations.value.length > 0) {
          maxElevation.value = elevations.value[0];
          minElevation.value = elevations.value[0];

          for (let i = 1; i < elevations.value.length; i++) {
            if (elevations.value[i] > maxElevation.value) {
              maxElevation.value = elevations.value[i];
            }
            if (elevations.value[i] < minElevation.value) {
              minElevation.value = elevations.value[i];
            }
          }
        }
      } else {
        // Reset max and min elevations if a different property is selected
        maxElevation.value = null;
        minElevation.value = null;
      }
    };

    // Watch for changes in sites and selectedProperty to update elevations
    watch([sites, selectedProperty], () => {
      extractElevations();
    });

    return { selectedProperty, maxElevation, minElevation };
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
    </select>

    <p>Selected Property: {{ selectedProperty }}</p>

    <div v-if="selectedProperty === 'elevation'">
      <p>Maximum Elevation: {{ maxElevation }}</p>
      <p>Minimum Elevation: {{ minElevation }}</p>
    </div>
  </div>
</template>
