import { DataViewFieldType } from 'app/constants';
import { Column } from '../../../slice/types';

export type FieldSemanticRole = 'dimension' | 'measure' | 'unknown';

export const getFieldSemanticRole = (field: Pick<Column, 'type'>): FieldSemanticRole => {
  if (field.type === DataViewFieldType.NUMERIC) return 'measure';
  if (
    field.type === DataViewFieldType.STRING ||
    field.type === DataViewFieldType.DATE ||
    field.type === DataViewFieldType.DATETIME
  ) {
    return 'dimension';
  }
  return 'unknown';
};

export const getFieldSemanticLabel = (field: Pick<Column, 'type'>) => {
  const role = getFieldSemanticRole(field);
  return role === 'measure' ? '度量' : role === 'dimension' ? '维度' : '待确认';
};

export const getFieldTypeLabel = (field: Pick<Column, 'type'>) => {
  switch (field.type) {
    case DataViewFieldType.NUMERIC:
      return '数值';
    case DataViewFieldType.STRING:
      return '文本';
    case DataViewFieldType.DATE:
      return '日期';
    case DataViewFieldType.DATETIME:
      return '日期时间';
    default:
      return '未知';
  }
};
