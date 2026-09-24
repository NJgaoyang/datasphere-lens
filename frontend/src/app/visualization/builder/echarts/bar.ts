import ChartDataSetDTO from 'app/types/ChartDataSet';
import { ChartSpec } from '../../core/ChartSpec';
import { buildCategoryAxis, buildValueAxis } from './common/axis';
import { getColumnValues } from './common/data';
import { buildLabel } from './common/label';
import { buildLegend } from './common/legend';
import { buildDefaultGrid } from './common/theme';
import { buildAxisTooltip } from './common/tooltip';

export interface BarVisualOptions {
  orientation?: 'vertical' | 'horizontal';
  stack?: boolean;
  label?: { show?: boolean; position?: string };
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
}

export const buildBarOption = (
  spec: ChartSpec<BarVisualOptions>,
  dataset?: ChartDataSetDTO,
) => {
  const dimension = spec.encoding?.x?.[0] || spec.dimensions[0];
  const measures = spec.encoding?.y?.length ? spec.encoding.y : spec.measures;
  const categories = getColumnValues(dataset, dimension);
  const horizontal =
    spec.options?.orientation === 'horizontal' || spec.type === 'cluster-bar-chart';
  const series = measures.map(measure => ({
    name: measure.alias || measure.fieldName || measure.fieldId,
    type: 'bar',
    stack: spec.options?.stack ? 'total' : undefined,
    label: buildLabel(spec.options?.label),
    data: getColumnValues(dataset, measure),
  }));

  return {
    tooltip: buildAxisTooltip(),
    legend: buildLegend(spec.options?.legend),
    grid: buildDefaultGrid(),
    xAxis: horizontal ? buildValueAxis() : buildCategoryAxis(categories),
    yAxis: horizontal ? buildCategoryAxis(categories) : buildValueAxis(),
    series,
  };
};
