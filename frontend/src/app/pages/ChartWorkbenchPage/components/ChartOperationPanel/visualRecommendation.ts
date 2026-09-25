import { DataViewFieldType } from 'app/constants';
import { ChartConfig } from 'app/types/ChartConfig';

export type VisualRecommendationProfile = {
  dimensions: number;
  measures: number;
  hasTimeDimension: boolean;
};

export function getVisualRecommendationProfile(
  chartConfig?: ChartConfig,
): VisualRecommendationProfile {
  const rows = (chartConfig?.datas || []).flatMap(section => section.rows || []);
  const measures = rows.filter(row => row.type === DataViewFieldType.NUMERIC).length;
  const dimensions = rows.length - measures;
  const hasTimeDimension = rows.some(
    row =>
      row.type === DataViewFieldType.DATE ||
      row.type === DataViewFieldType.DATETIME,
  );
  return { dimensions, measures, hasTimeDimension };
}

export function recommendVisualTypes(chartConfig?: ChartConfig): string[] {
  const { dimensions, measures, hasTimeDimension } =
    getVisualRecommendationProfile(chartConfig);
  if (!dimensions && !measures) return [];
  if (!dimensions && measures === 1) {
    return ['react-scorecard', 'gauge', 'mingxi-table'];
  }
  if (hasTimeDimension && measures >= 1) {
    return ['line-chart', 'area-chart', 'cluster-column-chart', 'mingxi-table'];
  }
  if (dimensions === 1 && measures === 1) {
    return ['cluster-column-chart', 'cluster-bar-chart', 'pie-chart', 'line-chart'];
  }
  if (dimensions === 1 && measures > 1) {
    return ['cluster-column-chart', 'line-chart', 'radar', 'mingxi-table'];
  }
  if (dimensions >= 2 && measures >= 1) {
    return ['heatmap-v2', 'treemap-v2', 'sunburst-v2', 'mingxi-table'];
  }
  return ['mingxi-table'];
}
