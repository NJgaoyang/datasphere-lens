import { ChartDataSectionType, DataViewFieldType } from 'app/constants';
import { ChartConfig } from 'app/types/ChartConfig';
import { recommendVisualTypes } from 'app/pages/ChartWorkbenchPage/components/ChartOperationPanel/visualRecommendation';
import { describe, expect, it } from 'vitest';

const config = (types: DataViewFieldType[]): ChartConfig => ({
  datas: [{
    key: 'fields',
    type: ChartDataSectionType.Mixed,
    rows: types.map((type, index) => ({
      uid: String(index),
      colName: `field_${index}`,
      type,
      category: 'field',
    })),
  }],
});

describe('recommendVisualTypes', () => {
  it('recommends indicator visuals for one measure', () => {
    expect(recommendVisualTypes(config([DataViewFieldType.NUMERIC]))[0]).toBe('react-scorecard');
  });

  it('prefers trend visuals for time plus measure', () => {
    expect(recommendVisualTypes(config([DataViewFieldType.DATE, DataViewFieldType.NUMERIC]))[0]).toBe('line-chart');
  });

  it('prefers comparison visuals for dimension plus measure', () => {
    expect(recommendVisualTypes(config([DataViewFieldType.STRING, DataViewFieldType.NUMERIC]))[0]).toBe('cluster-column-chart');
  });

  it('prefers multi-dimensional visuals for two dimensions plus a measure', () => {
    expect(recommendVisualTypes(config([
      DataViewFieldType.STRING,
      DataViewFieldType.STRING,
      DataViewFieldType.NUMERIC,
    ]))[0]).toBe('heatmap-v2');
  });
});
