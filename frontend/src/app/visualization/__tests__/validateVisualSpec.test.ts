import { VisualConfigSchema } from '../config/ConfigSchema';
import { validateVisualSpec } from '../config/validateVisualSpec';
import { ChartSpec } from '../core/ChartSpec';

const schema: VisualConfigSchema = {
  fieldSlots: [
    { key: 'source', label: '源维度', type: 'dimension', required: true, min: 1, max: 1 },
    { key: 'target', label: '目标维度', type: 'dimension', required: true, min: 1, max: 1 },
    { key: 'value', label: '权重', type: 'measure', required: true, min: 1, max: 1 },
  ],
  styles: [], settings: [], interactions: [],
};

const spec = (dimensionCount: number, measureCount: number): ChartSpec => ({
  version: 1,
  type: 'sankey-v2',
  dimensions: Array.from({ length: dimensionCount }, (_, index) => ({ fieldId: `d${index}` })),
  measures: Array.from({ length: measureCount }, (_, index) => ({ fieldId: `m${index}` })),
});

describe('validateVisualSpec', () => {
  test('groups same slot types and validates required counts', () => {
    expect(validateVisualSpec(spec(2, 1), schema).every(item => item.valid)).toBe(true);
  });

  test('reports missing fields with user-facing messages', () => {
    const invalid = validateVisualSpec(spec(1, 0), schema).filter(item => !item.valid);
    expect(invalid).toHaveLength(2);
    expect(invalid[0].message).toContain('至少需要');
  });

  test('reports too many fields', () => {
    const invalid = validateVisualSpec(spec(3, 1), schema).filter(item => !item.valid);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].message).toContain('最多允许 2 个字段');
  });
});
