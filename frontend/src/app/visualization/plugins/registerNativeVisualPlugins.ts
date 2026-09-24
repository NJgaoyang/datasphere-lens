import { buildBarOption } from '../builder/echarts/bar';
import { buildLineOption } from '../builder/echarts/line';
import { buildPieOption } from '../builder/echarts/pie';
import { chartRegistry, VisualOptionBuilder } from '../registry/ChartRegistry';

const upgradeVisual = (
  type: string,
  renderer: string,
  buildOption?: VisualOptionBuilder,
) => {
  const existing = chartRegistry.get(type);
  if (!existing) return;
  chartRegistry.register(
    {
      ...existing,
      renderer,
      buildOption,
    },
    { replace: true },
  );
};

export const registerNativeVisualPlugins = () => {
  upgradeVisual('cluster-column-chart', 'echarts', buildBarOption);
  upgradeVisual('cluster-bar-chart', 'echarts', buildBarOption);
  upgradeVisual('line-chart', 'echarts', buildLineOption);
  upgradeVisual('pie-chart', 'echarts', buildPieOption);
  upgradeVisual('mingxi-table', 'table');
};
