import ChartDataSetDTO from 'app/types/ChartDataSet';
import { ChartSpec } from '../../core/ChartSpec';
import { buildCategoryAxis, buildValueAxis } from './common/axis';
import { getColumnValues } from './common/data';
import { buildLabel } from './common/label';
import { buildLegend } from './common/legend';
import { buildDefaultGrid } from './common/theme';
import { buildAxisTooltip } from './common/tooltip';

export interface LineVisualOptions {
  smooth?: boolean;
  area?: boolean;
  label?: { show?: boolean; position?: string };
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
}

export const buildLineOption = (
  spec: ChartSpec<LineVisualOptions>,
  dataset?: ChartDataSetDTO,
) => {
  const dimension = spec.encoding?.x?.[0] || spec.dimensions[0];
  const measures = spec.encoding?.y?.length ? spec.encoding.y : spec.measures;
  const categories = getColumnValues(dataset, dimension);
  const series = measures.map(measure => ({
    name: measure.alias || measure.fieldName || measure.fieldId,
    type: 'line',
    smooth: Boolean(spec.options?.smooth),
    areaStyle: spec.options?.area ? {} : undefined,
    label: buildLabel(spec.options?.label),
    data: getColumnValues(dataset, measure),
  }));

  return {
    tooltip: buildAxisTooltip(),
    legend: buildLegend(spec.options?.legend),
    grid: buildDefaultGrid(),
    xAxis: buildCategoryAxis(categories),
    yAxis: buildValueAxis(),
    series,
  };
};
