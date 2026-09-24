import { IChart } from 'app/types/Chart';
import { chartRegistry, VisualCategory } from '../../registry/ChartRegistry';

const resolveCategory = (chartId: string): VisualCategory => {
  if (/table|sheet/i.test(chartId)) return 'table';
  if (/map/i.test(chartId)) return 'map';
  if (/score|gauge|card/i.test(chartId)) return 'indicator';
  if (/scatter|box|heat/i.test(chartId)) return 'distribution';
  if (/line|area/i.test(chartId)) return 'trend';
  if (/sankey|graph|relation|tree/i.test(chartId)) return 'relationship';
  if (/bar|column|pie|rose|funnel|waterfall|double-y|word/i.test(chartId)) {
    return 'comparison';
  }
  return 'custom';
};

export const registerLegacyVisual = (chart: IChart) => {
  chartRegistry.register(
    {
      type: chart.meta.id,
      name: chart.meta.name,
      icon: chart.meta.icon,
      category: resolveCategory(chart.meta.id),
      renderer: 'legacy',
      configSchema: chart.config,
      capabilities: {
        drill: Boolean(chart.config?.datas?.some(section => section.drillable)),
        linkage: true,
        export: true,
      },
      legacyChart: chart,
    },
    { replace: true },
  );
};

export const registerLegacyVisuals = (charts: IChart[]) =>
  charts.forEach(registerLegacyVisual);
