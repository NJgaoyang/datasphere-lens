import { ChartDataSectionType, DataViewFieldType } from 'app/constants';
import { ChartConfig } from 'app/types/ChartConfig';
import { ChartDataViewMeta } from 'app/types/ChartDataViewMeta';
import { describe, expect, it } from 'vitest';
import { placeFieldInChartConfig } from 'app/pages/ChartWorkbenchPage/components/ChartOperationPanel/fieldPlacement';

const config: ChartConfig = {
  datas: [
    { key: 'dimension', type: ChartDataSectionType.Group, limit: [1, 2], rows: [] },
    { key: 'measure', type: ChartDataSectionType.Aggregate, limit: [1, 3], rows: [] },
    { key: 'filter', type: ChartDataSectionType.Filter, rows: [] },
  ],
};

const field = (name: string, type: DataViewFieldType): ChartDataViewMeta => ({
  name,
  type,
  category: 'field',
});

describe('placeFieldInChartConfig', () => {
  it('places a dimension into the group section', () => {
    const result = placeFieldInChartConfig(config, field('region', DataViewFieldType.STRING));
    expect(result?.sectionIndex).toBe(0);
    expect(result?.section.rows?.[0].colName).toBe('region');
  });

  it('places a numeric field into the aggregate section', () => {
    const result = placeFieldInChartConfig(config, field('sales', DataViewFieldType.NUMERIC));
    expect(result?.sectionIndex).toBe(1);
    expect(result?.section.rows?.[0].colName).toBe('sales');
  });

  it('returns undefined when all compatible sections are full', () => {
    const full: ChartConfig = {
      datas: [{ key: 'dimension', type: ChartDataSectionType.Group, limit: 1, rows: [{ uid: '1', colName: 'city', type: DataViewFieldType.STRING, category: 'field' }] }],
    };
    expect(placeFieldInChartConfig(full, field('region', DataViewFieldType.STRING))).toBeUndefined();
  });
});
