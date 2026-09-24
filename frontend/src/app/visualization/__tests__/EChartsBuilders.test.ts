import { buildBarOption } from '../builder/echarts/bar';
import { buildLineOption } from '../builder/echarts/line';
import { buildPieOption } from '../builder/echarts/pie';

const dataset = {
  columns: [{ name: 'region' }, { name: 'sales' }, { name: 'profit' }],
  rows: [
    ['East', '10', '2'],
    ['West', '20', '5'],
  ],
};

const baseSpec = {
  version: 1,
  dimensions: [{ fieldId: 'region' }],
  measures: [{ fieldId: 'sales' }, { fieldId: 'profit' }],
};

describe('ECharts v2 builders', () => {
  test('builds bar option from ChartSpec and dataset', () => {
    const option: any = buildBarOption(
      { ...baseSpec, type: 'cluster-column-chart' },
      dataset,
    );
    expect(option.xAxis.data).toEqual(['East', 'West']);
    expect(option.series[0].data).toEqual(['10', '20']);
    expect(option.series).toHaveLength(2);
  });

  test('builds horizontal bar and line options', () => {
    const bar: any = buildBarOption(
      { ...baseSpec, type: 'cluster-bar-chart' },
      dataset,
    );
    const line: any = buildLineOption(
      { ...baseSpec, type: 'line-chart', options: { smooth: true } },
      dataset,
    );
    expect(bar.yAxis.data).toEqual(['East', 'West']);
    expect(line.series[0].smooth).toBe(true);
  });

  test('builds pie data pairs', () => {
    const pie: any = buildPieOption(
      {
        version: 1,
        type: 'pie-chart',
        dimensions: [{ fieldId: 'region' }],
        measures: [{ fieldId: 'sales' }],
      },
      dataset,
    );
    expect(pie.series[0].data).toEqual([
      { name: 'East', value: '10' },
      { name: 'West', value: '20' },
    ]);
  });
});
