
import { describe, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDepthStore } from '@/store/depthstore'; 

describe('depthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize depths correctly', () => {
    const depthStore = useDepthStore();
    expect(depthStore.depths).toEqual([10, 20, 30, 40, 50]);
  });

  it('should update depth correctly', () => {
    const depthStore = useDepthStore();
    depthStore.updateDepth(2, 25);
    expect(depthStore.depths).toEqual([10, 20, 25, 40, 50]);
  });

  it('should not allow depth to be lower than the previous value', () => {
    const depthStore = useDepthStore();
    depthStore.updateDepth(2, 5);
    expect(depthStore.depths).toEqual([10, 20, 10, 40, 50]);
  });

  it('should adjust following depths if current depth is not lower than the next depth', () => {
    const depthStore = useDepthStore();
    depthStore.updateDepth(2, 35);
    expect(depthStore.depths).toEqual([10, 20, 34, 40, 50]);
  });
});