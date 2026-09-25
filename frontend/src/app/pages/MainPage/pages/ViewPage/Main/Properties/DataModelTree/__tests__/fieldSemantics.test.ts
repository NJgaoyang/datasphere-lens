import { DataViewFieldType } from 'app/constants';
import {
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
});
