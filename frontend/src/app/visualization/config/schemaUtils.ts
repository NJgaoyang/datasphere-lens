import { ChartStyleConfig, ChartStyleSectionGroup } from 'app/types/ChartConfig';
import { ChartSpec, FieldBinding } from '../core/ChartSpec';
import { FieldSlotSchema, VisualConfigSchema } from './ConfigSchema';

const getSpecFields = (spec: ChartSpec, slot: FieldSlotSchema): FieldBinding[] => {
  switch (slot.type) {
    case 'dimension':
      return spec.dimensions;
    case 'measure':
      return spec.measures;
    case 'color':
    case 'size':
    case 'series':
    case 'label':
      return spec.encoding?.[slot.type] || [];
    default:
      return [];
  }
};

export const validateChartSpec = (spec: ChartSpec, schema: VisualConfigSchema) => {
  const errors: string[] = [];
  schema.fieldSlots.forEach(slot => {
    const count = getSpecFields(spec, slot).length;
    if ((slot.required || (slot.min || 0) > 0) && count < (slot.min || 1)) {
      errors.push(`${slot.key}: at least ${slot.min || 1} field(s) required`);
    }
    if (typeof slot.max === 'number' && count > slot.max) {
      errors.push(`${slot.key}: at most ${slot.max} field(s) allowed`);
    }
  });
  return errors;
};
const collectDefaults = (
  rows: ChartStyleSectionGroup[] = [],
  target: Record<string, unknown> = {},
) => {
  rows.forEach(row => {
    if (row.rows?.length) {
      target[row.key] = collectDefaults(row.rows, {});
      return;
    }
    if (row.default !== undefined) {
      target[row.key] = row.default;
    }
  });
  return target;
};

export const getConfigDefaults = (configs: ChartStyleConfig[] = []) =>
  collectDefaults(configs, {});

export const mergeConfigDefaults = <T extends Record<string, unknown>>(
  defaults: T,
  value?: Partial<T>,
): T => {
  const merged: Record<string, unknown> = { ...defaults };
  Object.entries(value || {}).forEach(([key, nextValue]) => {
    const currentValue = merged[key];
    if (
      currentValue &&
      nextValue &&
      typeof currentValue === 'object' &&
      typeof nextValue === 'object' &&
      !Array.isArray(currentValue) &&
      !Array.isArray(nextValue)
    ) {
      merged[key] = mergeConfigDefaults(
        currentValue as Record<string, unknown>,
        nextValue as Record<string, unknown>,
      );
    } else {
      merged[key] = nextValue;
    }
  });
  return merged as T;
};
