import ChartDataSetDTO from 'app/types/ChartDataSet';
import { FieldBinding } from '../../../core/ChartSpec';

export const resolveColumnIndex = (
  dataset: ChartDataSetDTO | undefined,
  field: FieldBinding | undefined,
) => {
  if (!dataset?.columns?.length || !field) return -1;
  return dataset.columns.findIndex(column => {
    const name = column.name || '';
    return name === field.fieldId || name === field.fieldName || name === field.alias;
  });
};

export const getColumnValues = (
  dataset: ChartDataSetDTO | undefined,
  field: FieldBinding | undefined,
) => {
  const index = resolveColumnIndex(dataset, field);
  if (index < 0) return [];
  return (dataset?.rows || []).map(row => row[index]);
};
