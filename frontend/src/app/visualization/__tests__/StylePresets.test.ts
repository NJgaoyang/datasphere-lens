import { ChartStyleConfig } from 'app/types/ChartConfig';
import { getVisualStylePresetPatches } from '../config/stylePresets';
import { describe, expect, it } from 'vitest';

const configs: ChartStyleConfig[] = [
  {
    key: 'basic',
    label: '基础',
    comType: 'group',
    rows: [
      { key: 'showLabel', label: '标签', comType: 'switch', value: false },
      { key: 'animation', label: '动画', comType: 'switch', value: false },
      { key: 'unknown', label: '其他', comType: 'switch', value: true },
    ],
  },
];

describe('getVisualStylePresetPatches', () => {
  it('only patches supported existing keys', () => {
    const patches = getVisualStylePresetPatches(configs, 'emphasis');
    expect(patches.map(item => item.config.key)).toEqual(['showLabel', 'animation']);
    expect(patches[0].ancestors).toEqual([0, 0]);
    expect(patches[0].config.value).toBe(true);
  });

  it('applies minimal values without introducing new config rows', () => {
    const patches = getVisualStylePresetPatches(configs, 'minimal');
    expect(patches).toHaveLength(2);
    expect(patches.find(item => item.config.key === 'showLabel')?.config.value).toBe(false);
    expect(patches.find(item => item.config.key === 'animation')?.config.value).toBe(false);
  });
});
