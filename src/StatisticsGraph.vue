<script>
import Plotly from "plotly.js-dist";

export default {
  methods: {
    plotGraph(selectedProperty) {
      let dataArr = extractPropertyData(selectedProperty);
      const trace = {
        x: dataArr,
        type: "histogram",
      };
      const data = [trace];
      Plotly.newPlot("myDiv", data);
    },
  },
};
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
    </div>
</template>