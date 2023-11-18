<script>
import { ref, onMounted, watchEffect } from 'vue';

export default {
  setup() {
    const sites = ref([]);

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

      // Calculate maximum and minimum elevations
       maxElevation.value = Math.max(...elevations.value);
      //minElevation.value = Math.min(...elevations.value);

      //console.log('Elevations:', elevations.value);
      //console.log('Max Elevation:', maxElevation.value);
      //console.log('Min Elevation:', minElevation.value);
      
    //};

    // Call extractElevations when sites.value changes
    //watchEffect(() => {
      //extractElevations();
    //});

    //return { elevations, maxElevation, minElevation };
  //},
//};
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

      console.log('Elevations:', elevations.value);
      console.log('Max Elevation:', maxElevation.value);
      console.log('Min Elevation:', minElevation.value);
    };

    // Call extractElevations when sites.value changes
    watchEffect(() => {
      extractElevations();
    });

    return { elevations, maxElevation, minElevation };
  },
};
</script>

<template>
  <div>
    <h2>Elevation Data</h2>
    <ul>
      <!--li v-for="elevation in elevations" :key="elevation">{{ elevation }}</li-->
    </ul>
    <p>Maximum Elevation: {{ maxElevation }}</p>
    <p>Minimum Elevation: {{ minElevation }}</p>
  </div>
</template>

