import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useStatisticsStore = defineStore("statisticStore", () => {
  const nameOfStatisticStore = ref("statisticStore");
  const maxValues = ref({ 0: 0 });
  const minValues = ref({ 0: 0 });
  const selectedPropertyName = ref();
  const plotImageUrl = ref(null);
  
  return {
    nameOfStatisticStore,
    maxValues,
    minValues,
    selectedPropertyName,
    plotImageUrl,
    maxPropertyValue: computed(() => selectedPropertyName.value ? maxValues.value[selectedPropertyName.value] : null),
    minPropertyValue: computed(() => selectedPropertyName.value ? minValues.value[selectedPropertyName.value] : null),

  };
});