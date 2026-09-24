import { fromLegacyChartConfig } from '../config/ConfigSchema';
import {
  getConfigDefaults,
  mergeConfigDefaults,
  validateChartSpec,
} from '../config/schemaUtils';

describe('ConfigSchema', () => {
  test('adapts legacy chart config field slots', () => {
    const schema = fromLegacyChartConfig({
      datas: [
        { key: 'dimension', label: 'Dimension', type: 'group', limit: [1, 1], required: true },
        { key: 'metrics', label: 'Metrics', type: 'aggregate', limit: [1, 3], required: true },
      ],
    });

    expect(schema.fieldSlots[0]).toMatchObject({ type: 'dimension', min: 1, max: 1 });
    expect(schema.fieldSlots[1]).toMatchObject({ type: 'measure', min: 1, max: 3 });
  });

  test('validates field limits and merges defaults', () => {
    const schema = fromLegacyChartConfig({
      datas: [{ key: 'dimension', label: 'Dimension', type: 'group', limit: [1, 1], required: true }],
    });
    const errors = validateChartSpec(
      { version: 1, type: 'bar', dimensions: [], measures: [] },
      schema,
    );
    expect(errors).toHaveLength(1);

    const defaults = getConfigDefaults([
      { key: 'label', label: 'Label', comType: 'group', rows: [{ key: 'show', label: 'Show', comType: 'checkbox', default: true }] },
    ]);
    expect(mergeConfigDefaults(defaults, { label: { show: false } })).toEqual({ label: { show: false } });
  });
});
