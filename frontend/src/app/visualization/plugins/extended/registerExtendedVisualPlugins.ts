import { VisualConfigSchema } from '../../config/ConfigSchema';
import {
  chartRegistry,
  VisualPluginDefinition,
} from '../../registry/ChartRegistry';
import {
  buildBoxplotOption,
  buildGraphOption,
  buildHeatmapOption,
  buildSankeyOption,
  buildSunburstOption,
  buildTreeOption,
  buildTreemapOption,
} from '../../builder/echarts/extended';

const schema = (
  dimensions: Array<{ key: string; label: string; min?: number; max?: number }>,
  measures: Array<{
    key: string;
    label: string;
    required?: boolean;
    min?: number;
    max?: number;
  }>,
  options: { axis?: boolean } = {},
): VisualConfigSchema => ({
  fieldSlots: [
    ...dimensions.map(item => ({
      key: item.key,
      label: item.label,
      type: 'dimension' as const,
      required: true,
      min: item.min ?? 1,
      max: item.max ?? 1,
    })),
    ...measures.map(item => ({
      key: item.key,
      label: item.label,
      type: 'measure' as const,
      required: item.required ?? true,
      min: item.min ?? 1,
      max: item.max ?? 1,
    })),
    {
      key: 'filter',
      label: 'filter',
      type: 'filter' as const,
      allowSameField: true,
    },
  ],
  styles: [
    {
      label: '基础样式',
      key: 'v2Basic',
      comType: 'group',
      rows: [
        {
          label: '显示数据标签',
          key: 'showLabel',
          default: true,
          comType: 'switch',
        },
        {
          label: '标签字号',
          key: 'labelFontSize',
          default: 12,
          comType: 'inputNumber',
          options: { min: 8, max: 32 },
        },
        {
          label: '显示 Tooltip',
          key: 'showTooltip',
          default: true,
          comType: 'switch',
        },
        {
          label: '启用动画',
          key: 'animation',
          default: true,
          comType: 'switch',
        },
      ],
    },
    {
      label: '标题',
      key: 'v2Title',
      comType: 'group',
      rows: [
        {
          label: '显示标题',
          key: 'showTitle',
          default: false,
          comType: 'switch',
        },
        {
          label: '标题文本',
          key: 'titleText',
          default: '',
          comType: 'input',
        },
        {
          label: '标题位置',
          key: 'titleAlign',
          default: 'left',
          comType: 'select',
          options: {
            items: [
              { label: '左侧', value: 'left' },
              { label: '居中', value: 'center' },
              { label: '右侧', value: 'right' },
            ],
          },
        },
      ],
    },
    ...(options.axis
      ? [
          {
            label: '坐标轴',
            key: 'v2Axis',
            comType: 'group' as const,
            rows: [
              {
                label: '显示 X 轴',
                key: 'showXAxis',
                default: true,
                comType: 'switch' as const,
              },
              {
                label: '显示 Y 轴',
                key: 'showYAxis',
                default: true,
                comType: 'switch' as const,
              },
            ],
          },
        ]
      : []),
  ],
  settings: [
    {
      label: '浏览与交互',
      key: 'v2Interaction',
      comType: 'group',
      rows: [
        {
          label: '允许缩放/拖拽',
          key: 'roam',
          default: true,
          comType: 'switch',
        },
      ],
    },
  ],
  interactions: [],
});

const plugins: VisualPluginDefinition[] = [
  {
    type: 'sankey-v2',
    name: '桑基图',
    icon: 'chart',
    category: 'relationship',
    renderer: 'echarts',
    configSchema: schema(
      [
        { key: 'source', label: '源维度' },
        { key: 'target', label: '目标维度' },
      ],
      [{ key: 'value', label: '权重' }],
    ),
    buildOption: buildSankeyOption,
    capabilities: { linkage: true, export: true },
  },
  {
    type: 'graph-v2',
    name: '关系图',
    icon: 'chart',
    category: 'relationship',
    renderer: 'echarts',
    configSchema: schema(
      [
        { key: 'source', label: '源节点' },
        { key: 'target', label: '目标节点' },
      ],
      [{ key: 'value', label: '权重' }],
    ),
    buildOption: buildGraphOption,
    capabilities: { zoom: true, linkage: true, export: true },
  },
  {
    type: 'tree-v2',
    name: '树图',
    icon: 'chart',
    category: 'relationship',
    renderer: 'echarts',
    configSchema: schema(
      [{ key: 'path', label: '层级维度', min: 1, max: 8 }],
      [{ key: 'value', label: '指标', required: false, min: 0, max: 1 }],
    ),
    buildOption: buildTreeOption,
    capabilities: { drill: true, zoom: true, export: true },
  },
  {
    type: 'treemap-v2',
    name: '矩形树图',
    icon: 'chart',
    category: 'relationship',
    renderer: 'echarts',
    configSchema: schema(
      [{ key: 'path', label: '层级维度', min: 1, max: 8 }],
      [{ key: 'value', label: '指标' }],
    ),
    buildOption: buildTreemapOption,
    capabilities: { drill: true, zoom: true, export: true },
  },
  {
    type: 'sunburst-v2',
    name: '旭日图',
    icon: 'chart',
    category: 'relationship',
    renderer: 'echarts',
    configSchema: schema(
      [{ key: 'path', label: '层级维度', min: 1, max: 8 }],
      [{ key: 'value', label: '指标' }],
    ),
    buildOption: buildSunburstOption,
    capabilities: { drill: true, export: true },
  },
  {
    type: 'heatmap-v2',
    name: '热力图',
    icon: 'chart',
    category: 'distribution',
    renderer: 'echarts',
    configSchema: schema(
      [
        { key: 'x', label: 'X 维度' },
        { key: 'y', label: 'Y 维度' },
      ],
      [{ key: 'value', label: '指标' }],
      { axis: true },
    ),
    buildOption: buildHeatmapOption,
    capabilities: { zoom: true, export: true },
  },
  {
    type: 'boxplot-v2',
    name: '箱线图',
    icon: 'chart',
    category: 'distribution',
    renderer: 'echarts',
    configSchema: schema(
      [{ key: 'category', label: '分类维度' }],
      [{ key: 'value', label: '数值' }],
      { axis: true },
    ),
    buildOption: buildBoxplotOption,
    capabilities: { export: true },
  },
];

export const registerExtendedVisualPlugins = () => {
  plugins.forEach(plugin => chartRegistry.register(plugin, { replace: true }));
};

export const extendedVisualPlugins = plugins;
