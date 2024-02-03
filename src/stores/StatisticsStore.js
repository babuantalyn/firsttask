import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useStatisticsStore = defineStore("statisticStore", () => {
  const nameOfStatisticStore = ref("statisticStore");
  const maxValues = ref({});
  const minValues = ref({});
  const selectedPropertyName = ref(null); // Property to store the selected property name

  return {
    nameOfStatisticStore,
    maxValues,
    minValues,
    selectedPropertyName,
    maxPropertyValue: computed(() => selectedPropertyName.value ? maxValues.value[selectedPropertyName.value] || 0 : 0),
    minPropertyValue: computed(() => selectedPropertyName.value ? minValues.value[selectedPropertyName.value] || 0 : 0),

  };
});