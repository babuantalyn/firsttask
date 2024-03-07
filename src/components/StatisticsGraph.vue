<script setup>
import Plotly from "plotly.js-dist";

const plotGraph = (selectedProperty, dataArr) => {
  const trace = {
    x: dataArr,
    type: "histogram",
  };
  const data = [trace];
  Plotly.newPlot("myDiv", data);
};

</script>

<template>
  <div id="myDiv" style="width: 600px; height: 400px;"></div>
</template>
