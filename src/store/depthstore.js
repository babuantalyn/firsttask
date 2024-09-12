import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDepthStore = defineStore('depthStore', () => {
  const depths = ref([10, 20, 30, 40, 50]);

  function updateDepth(index, newValue) {
    if (index > 0 && newValue < depths.value[index - 1]) {
      newValue = depths.value[index - 1];
    }

    depths.value[index] = newValue;

    if (index < depths.value.length - 1 && depths.value[index] >= depths.value[index + 1]) {
      depths.value[index] = depths.value[index + 1] - 1;
    }
  }

  return {
    depths,
    updateDepth,
  };
});
