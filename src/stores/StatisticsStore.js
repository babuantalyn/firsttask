import { defineStore } from 'pinia';

// Define your store
export const useStatisticsStore = defineStore(
  'myStore', {
  state: () => ({
  
    trialValue: 'Hello Andrew',
  }),
  getters: {
    getAllValues() {
      return {
        trialValue: this.trialValue,
        
      };
    },
  },
});