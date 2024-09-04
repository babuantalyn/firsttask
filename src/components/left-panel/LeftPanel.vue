<script setup>
// import simplebar from "simplebar-vue";

import { defineEmits, defineProps } from 'vue'

import {
  COffcanvasHeader,
  COffcanvasTitle,
  CCloseButton,
  COffcanvasBody
} from '@coreui/bootstrap-vue'

import AnalysisPanal from './analysis-panel/AnalysisPanal.vue'

import { Map } from 'maplibre-gl'

const props = defineProps({
  title: String,
  map: Map
})

const emit = defineEmits(['collapse-event', 'toggle-event'])
</script>

<template>
  <COffcanvasHeader class="bg-primary">
    <COffcanvasTitle class="text-white">{{ props.title }}</COffcanvasTitle>
    <CCloseButton
      class="text-reset text-primary"
      @click="emit('collapse-event'), emit('toggle-event')"
    />
  </COffcanvasHeader>
  <COffcanvasBody>
    <KeepAlive>
      <AnalysisPanal v-if="props.title === 'Analysis'" :map="props.map" />
    </KeepAlive>
  </COffcanvasBody>
</template>

<style scoped></style>
