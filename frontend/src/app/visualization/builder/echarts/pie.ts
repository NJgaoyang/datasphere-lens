import ChartDataSetDTO from 'app/types/ChartDataSet';
import { ChartSpec } from '../../core/ChartSpec';
import { getColumnValues } from './common/data';
import { buildLabel } from './common/label';
import { buildLegend } from './common/legend';
import { buildItemTooltip } from './common/tooltip';

export interface PieVisualOptions {
  donut?: boolean;
  rose?: boolean;
  label?: { show?: boolean; position?: string };
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
}

export const buildPieOption = (
  spec: ChartSpec<PieVisualOptions>,
  dataset?: ChartDataSetDTO,
) => {
  const dimension = spec.encoding?.color?.[0] || spec.dimensions[0];
  const measure = spec.encoding?.y?.[0] || spec.measures[0];
  const names = getColumnValues(dataset, dimension);
  const values = getColumnValues(dataset, measure);
  const data = names.map((name, index) => ({ name, value: values[index] }));

  return {
    tooltip: buildItemTooltip(),
    legend: buildLegend(spec.options?.legend),
    series: [
      {
        name: measure?.alias || measure?.fieldName || measure?.fieldId,
        type: 'pie',
        radius: spec.options?.donut ? ['45%', '70%'] : '70%',
        roseType: spec.options?.rose ? 'radius' : undefined,
        label: buildLabel(spec.options?.label),
        data,
      },
    ],
  };
};
