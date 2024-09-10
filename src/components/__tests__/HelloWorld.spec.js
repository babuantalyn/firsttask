import { test, expect } from "vitest";

function sum(a, b) {
  return a + b;
}

test("add 2 numbers", () => {
  expect(sum(2,3)).toEqual(5);
});

import { mount } from '@vue/test-utils';
import DistanceComponent from '@/components/left-panel/analysis-panel/DigitalBorehole.vue';
import * as turf from '@turf/turf';

describe('DistanceComponent.vue', () => {
  it('calculates the correct distance between two points', () => {
    jest.spyOn(turf, 'distance').mockReturnValue(10); 

    const wrapper = mount(DistanceComponent);

    expect(wrapper.text()).toContain('10 km');
  });
});
