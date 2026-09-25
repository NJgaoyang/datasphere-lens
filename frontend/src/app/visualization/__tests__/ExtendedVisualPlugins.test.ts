import { visualPluginToChart } from '../adapters/VisualPluginChartAdapter';
import { chartRegistry } from '../registry/ChartRegistry';
import {
  extendedVisualPlugins,
  registerExtendedVisualPlugins,
} from '../plugins/extended/registerExtendedVisualPlugins';

const dataset = {
  columns: [
    { name: 'source' },
    { name: 'target' },
    { name: 'value' },
  ],
  rows: [
    ['A', 'B', '10'],
    ['A', 'C', '20'],
    ['B', 'C', '5'],
  ],
};

const relationshipSpec = {
  version: 1,
  type: 'sankey-v2',
  dimensions: [{ fieldId: 'source' }, { fieldId: 'target' }],
  measures: [{ fieldId: 'value' }],
};

describe('extended visual plugins', () => {
  beforeEach(() => chartRegistry.clear());

  test('registers pure v2 plugins without legacy chart classes', () => {
    registerExtendedVisualPlugins();
    expect(chartRegistry.get('sankey-v2')?.renderer).toBe('echarts');
    expect(chartRegistry.get('heatmap-v2')?.category).toBe('distribution');
    expect(chartRegistry.get('boxplot-v2')?.legacyChart).toBeUndefined();
    expect(extendedVisualPlugins).toHaveLength(7);
  });

  test('builds sankey links and auto-adapts to the legacy editor contract', () => {
    registerExtendedVisualPlugins();
    const plugin = chartRegistry.get('sankey-v2')!;
    const option = plugin.buildOption?.(relationshipSpec, dataset) as any;
    expect(option.series[0].type).toBe('sankey');
    expect(option.series[0].links).toHaveLength(3);

    const chart = visualPluginToChart(plugin);
    expect(chart.meta.id).toBe('sankey-v2');
    expect(chart.config?.datas).toHaveLength(4);
  });

  test('builds heatmap and boxplot options from dataset rows', () => {
    registerExtendedVisualPlugins();
    const heatmap = chartRegistry.get('heatmap-v2')!;
    const heatmapOption = heatmap.buildOption?.(
      { ...relationshipSpec, type: 'heatmap-v2' },
      dataset,
    ) as any;
    expect(heatmapOption.series[0].type).toBe('heatmap');
    expect(heatmapOption.series[0].data).toHaveLength(3);

    const boxplot = chartRegistry.get('boxplot-v2')!;
    const boxplotOption = boxplot.buildOption?.(
      {
        version: 1,
        type: 'boxplot-v2',
        dimensions: [{ fieldId: 'source' }],
        measures: [{ fieldId: 'value' }],
      },
      dataset,
    ) as any;
    expect(boxplotOption.series[0].type).toBe('boxplot');
    expect(boxplotOption.xAxis.data).toEqual(['A', 'B']);
  });
  test('exposes grouped style and analysis controls for v2 visuals', () => {
    const heatmap = extendedVisualPlugins.find(plugin => plugin.type === 'heatmap-v2')!;
    expect(heatmap.configSchema!.styles.map(item => item.key)).toEqual([
      'v2Basic',
      'v2Title',
      'v2Axis',
    ]);
    expect(heatmap.configSchema!.settings[0].key).toBe('v2Interaction');
  });

  test('applies title, label and axis settings to v2 options', () => {
    registerExtendedVisualPlugins();
    const heatmap = chartRegistry.get('heatmap-v2')!;
    const config: any = {
      styles: [
        {
          key: 'v2Basic',
          label: '基础样式',
          comType: 'group',
          rows: [
            { key: 'showLabel', label: '标签', comType: 'switch', value: false },
            { key: 'labelFontSize', label: '字号', comType: 'inputNumber', value: 18 },
            { key: 'showTooltip', label: '提示', comType: 'switch', value: true },
            { key: 'animation', label: '动画', comType: 'switch', value: true },
          ],
        },
        {
          key: 'v2Title',
          label: '标题',
          comType: 'group',
          rows: [
            { key: 'showTitle', label: '显示', comType: 'switch', value: true },
            { key: 'titleText', label: '文本', comType: 'input', value: '销售热力图' },
            { key: 'titleAlign', label: '位置', comType: 'select', value: 'center' },
          ],
        },
        {
          key: 'v2Axis',
          label: '坐标轴',
          comType: 'group',
          rows: [
            { key: 'showXAxis', label: 'X', comType: 'switch', value: false },
            { key: 'showYAxis', label: 'Y', comType: 'switch', value: true },
          ],
        },
      ],
      settings: [
        {
          key: 'v2Interaction',
          label: '浏览与交互',
          comType: 'group',
          rows: [{ key: 'roam', label: '缩放', comType: 'switch', value: false }],
        },
      ],
    };
    const option = heatmap.buildOption?.(
      { ...relationshipSpec, type: 'heatmap-v2' },
      dataset,
      config,
    ) as any;
    expect(option.title).toMatchObject({ show: true, text: '销售热力图', left: 'center' });
    expect(option.series[0].label).toMatchObject({ show: false, fontSize: 18 });
    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(true);
  });

});
