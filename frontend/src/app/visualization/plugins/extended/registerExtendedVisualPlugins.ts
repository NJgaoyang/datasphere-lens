import { VisualConfigSchema } from '../../config/ConfigSchema';
import { chartRegistry, VisualPluginDefinition } from '../../registry/ChartRegistry';
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
  measures: Array<{ key: string; label: string; required?: boolean; min?: number; max?: number }>,
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
    { key: 'filter', label: 'filter', type: 'filter' as const, allowSameField: true },
  ],
  styles: [],
  settings: [],
  interactions: [],
});

const plugins: VisualPluginDefinition[] = [
  {
    type: 'sankey-v2',
    name: 'Sankey',
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
    name: 'Relationship Graph',
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
    name: 'Tree',
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
    name: 'Treemap',
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
    name: 'Sunburst',
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
    name: 'Heatmap',
    icon: 'chart',
    category: 'distribution',
    renderer: 'echarts',
    configSchema: schema(
      [
        { key: 'x', label: 'X 维度' },
        { key: 'y', label: 'Y 维度' },
      ],
      [{ key: 'value', label: '指标' }],
    ),
    buildOption: buildHeatmapOption,
    capabilities: { zoom: true, export: true },
  },
  {
    type: 'boxplot-v2',
    name: 'Boxplot',
    icon: 'chart',
    category: 'distribution',
    renderer: 'echarts',
    configSchema: schema(
      [{ key: 'category', label: '分类维度' }],
      [{ key: 'value', label: '数值' }],
    ),
    buildOption: buildBoxplotOption,
    capabilities: { export: true },
  },
];

export const registerExtendedVisualPlugins = () => {
  plugins.forEach(plugin => chartRegistry.register(plugin, { replace: true }));
};

export const extendedVisualPlugins = plugins;
