import ChartDataSetDTO from 'app/types/ChartDataSet';
import { ChartConfig } from 'app/types/ChartConfig';
import { getStyles } from 'app/utils/chartHelper';
import { ChartSpec, FieldBinding } from '../../core/ChartSpec';
import { resolveColumnIndex } from './common/data';

const valueAt = (
  dataset: ChartDataSetDTO | undefined,
  row: string[],
  field: FieldBinding | undefined,
) => {
  const index = resolveColumnIndex(dataset, field);
  return index >= 0 ? row[index] : undefined;
};

const asNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const uniq = (values: unknown[]) =>
  Array.from(new Set(values.filter(v => v !== undefined && v !== null))).map(
    String,
  );

const getVisualStyle = (config?: ChartConfig) => {
  const [showLabel, showTooltip, animation, roam] = getStyles(
    config?.styles || [],
    ['v2Basic'],
    ['showLabel', 'showTooltip', 'animation', 'roam'],
  );
  return {
    showLabel: showLabel ?? true,
    showTooltip: showTooltip ?? true,
    animation: animation ?? true,
    roam: roam ?? true,
  };
};

export const buildSankeyOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const [sourceField, targetField] = spec.dimensions;
  const valueField = spec.measures[0];
  const links = (dataset?.rows || [])
    .map(row => ({
      source: String(valueAt(dataset, row, sourceField) ?? ''),
      target: String(valueAt(dataset, row, targetField) ?? ''),
      value: asNumber(valueAt(dataset, row, valueField)),
    }))
    .filter(link => link.source && link.target);
  const nodes = uniq(links.flatMap(link => [link.source, link.target])).map(
    name => ({ name }),
  );
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip, trigger: 'item' },
    series: [
      {
        type: 'sankey',
        data: nodes,
        links,
        label: { show: style.showLabel },
        emphasis: { focus: 'adjacency' },
      },
    ],
  };
};

export const buildGraphOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const [sourceField, targetField] = spec.dimensions;
  const valueField = spec.measures[0];
  const links = (dataset?.rows || [])
    .map(row => ({
      source: String(valueAt(dataset, row, sourceField) ?? ''),
      target: String(valueAt(dataset, row, targetField) ?? ''),
      value: asNumber(valueAt(dataset, row, valueField)),
    }))
    .filter(link => link.source && link.target);
  const totals = new Map<string, number>();
  links.forEach(link => {
    totals.set(link.source, (totals.get(link.source) || 0) + link.value);
    totals.set(link.target, (totals.get(link.target) || 0) + link.value);
  });
  const data = Array.from(totals, ([name, value]) => ({
    name,
    value,
    symbolSize: Math.max(12, Math.sqrt(Math.abs(value)) * 4),
  }));
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: style.roam,
        label: { show: style.showLabel },
        data,
        links,
        force: { repulsion: 120, edgeLength: 80 },
      },
    ],
  };
};

type HierarchyNode = {
  name: string;
  value?: number;
  children?: HierarchyNode[];
};

const buildHierarchy = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
): HierarchyNode[] => {
  const roots: HierarchyNode[] = [];
  const measure = spec.measures[0];
  for (const row of dataset?.rows || []) {
    const path = spec.dimensions
      .map(field => valueAt(dataset, row, field))
      .filter(v => v !== undefined && v !== null && String(v) !== '')
      .map(String);
    if (!path.length) continue;
    let children = roots;
    path.forEach((name, index) => {
      let node = children.find(item => item.name === name);
      if (!node) {
        node = { name };
        children.push(node);
      }
      if (index === path.length - 1) {
        node.value =
          (node.value || 0) + asNumber(valueAt(dataset, row, measure) ?? 1);
      } else {
        node.children ||= [];
        children = node.children;
      }
    });
  }
  const aggregate = (node: HierarchyNode): number => {
    if (node.children?.length) {
      node.value = node.children.reduce(
        (sum, child) => sum + aggregate(child),
        0,
      );
    }
    return node.value || 0;
  };
  roots.forEach(aggregate);
  return roots;
};

export const buildTreeOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: {
      show: style.showTooltip,
      trigger: 'item',
      triggerOn: 'mousemove',
    },
    series: [
      {
        type: 'tree',
        data: [{ name: 'Root', children: buildHierarchy(spec, dataset) }],
        top: '5%',
        left: '8%',
        bottom: '5%',
        right: '18%',
        symbolSize: 9,
        roam: style.roam,
        label: {
          show: style.showLabel,
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
        },
        leaves: {
          label: {
            show: style.showLabel,
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
          },
        },
        expandAndCollapse: true,
      },
    ],
  };
};

export const buildTreemapOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip, trigger: 'item' },
    series: [
      {
        type: 'treemap',
        roam: style.roam,
        label: { show: style.showLabel },
        nodeClick: 'zoomToNode',
        data: buildHierarchy(spec, dataset),
      },
    ],
  };
};

export const buildSunburstOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip, trigger: 'item' },
    series: [
      {
        type: 'sunburst',
        radius: ['10%', '90%'],
        label: { show: style.showLabel },
        data: buildHierarchy(spec, dataset),
        emphasis: { focus: 'ancestor' },
      },
    ],
  };
};

export const buildHeatmapOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const [xField, yField] = spec.dimensions;
  const valueField = spec.measures[0];
  const rows = dataset?.rows || [];
  const xValues = uniq(rows.map(row => valueAt(dataset, row, xField)));
  const yValues = uniq(rows.map(row => valueAt(dataset, row, yField)));
  const data = rows
    .map(row => [
      xValues.indexOf(String(valueAt(dataset, row, xField) ?? '')),
      yValues.indexOf(String(valueAt(dataset, row, yField) ?? '')),
      asNumber(valueAt(dataset, row, valueField)),
    ])
    .filter(([x, y]) => x >= 0 && y >= 0);
  const values = data.map(item => item[2]);
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip, position: 'top' },
    grid: { left: '10%', right: '8%', top: '8%', bottom: '16%' },
    xAxis: { type: 'category', data: xValues, splitArea: { show: true } },
    yAxis: { type: 'category', data: yValues, splitArea: { show: true } },
    visualMap: {
      min: Math.min(0, ...values),
      max: Math.max(1, ...values),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
    },
    series: [
      {
        type: 'heatmap',
        data,
        label: { show: style.showLabel },
        emphasis: { itemStyle: { shadowBlur: 8 } },
      },
    ],
  };
};

const quantile = (sorted: number[], q: number) => {
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
};

export const buildBoxplotOption = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
  config?: ChartConfig,
) => {
  const categoryField = spec.dimensions[0];
  const valueField = spec.measures[0];
  const groups = new Map<string, number[]>();
  for (const row of dataset?.rows || []) {
    const category = String(valueAt(dataset, row, categoryField) ?? '');
    if (!category) continue;
    const value = Number(valueAt(dataset, row, valueField));
    if (!Number.isFinite(value)) continue;
    const values = groups.get(category) || [];
    values.push(value);
    groups.set(category, values);
  }
  const categories = Array.from(groups.keys());
  const data = categories.map(category => {
    const values = [...(groups.get(category) || [])].sort((a, b) => a - b);
    return [
      values[0] || 0,
      quantile(values, 0.25),
      quantile(values, 0.5),
      quantile(values, 0.75),
      values[values.length - 1] || 0,
    ];
  });
  const style = getVisualStyle(config);
  return {
    animation: style.animation,
    tooltip: { show: style.showTooltip, trigger: 'item' },
    xAxis: { type: 'category', data: categories, boundaryGap: true },
    yAxis: { type: 'value' },
    series: [{ type: 'boxplot', data }],
  };
};
