import { DataViewFieldType } from 'app/constants';
import {
  filterColumnsBySemanticRole,
  getFieldSemanticLabel,
  getFieldSemanticRole,
  getFieldTypeLabel,
} from '../fieldSemantics';
import { describe, expect, it } from 'vitest';

describe('field semantics', () => {
  it('treats numeric fields as measures', () => {
    expect(getFieldSemanticRole({ type: DataViewFieldType.NUMERIC })).toBe('measure');
    expect(getFieldSemanticLabel({ type: DataViewFieldType.NUMERIC })).toBe('度量');
  });

  it('treats text and date fields as dimensions', () => {
    expect(getFieldSemanticRole({ type: DataViewFieldType.STRING })).toBe('dimension');
    expect(getFieldSemanticRole({ type: DataViewFieldType.DATE })).toBe('dimension');
  });

  it('returns readable type labels', () => {
    expect(getFieldTypeLabel({ type: DataViewFieldType.DATETIME })).toBe('日期时间');
  });

  it('filters semantic roles while preserving matching hierarchy parents', () => {
    const columns: any[] = [
      { name: 'region', type: DataViewFieldType.STRING },
      { name: 'sales', type: DataViewFieldType.NUMERIC },
      {
        name: 'dateHierarchy',
        type: DataViewFieldType.STRING,
        children: [
          { name: 'date', type: DataViewFieldType.DATE },
          { name: 'amount', type: DataViewFieldType.NUMERIC },
        ],
      },
    ];
    expect(filterColumnsBySemanticRole(columns, 'measure')).toEqual([
      columns[1],
      { ...columns[2], children: [columns[2].children[1]] },
    ]);
    expect(filterColumnsBySemanticRole(columns, 'dimension')).toHaveLength(2);
    expect(filterColumnsBySemanticRole(columns, 'all')).toBe(columns);
  });
});
