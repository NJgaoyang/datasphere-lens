import { ChartSpec } from '../core/ChartSpec';
import { FieldSlotSchema, VisualConfigSchema } from './ConfigSchema';

export interface FieldSlotValidationResult {
  slot: FieldSlotSchema;
  count: number;
  valid: boolean;
  message?: string;
}

const countBindings = (spec: ChartSpec, slot: FieldSlotSchema) => {
  switch (slot.type) {
    case 'dimension':
      return spec.dimensions.length;
    case 'measure':
      return spec.measures.length;
    case 'filter':
      return spec.filters?.length || 0;
    case 'color':
    case 'size':
    case 'series':
    case 'label':
      return spec.encoding?.[slot.type]?.length || 0;
    default:
      return spec.encoding?.[slot.key]?.length || 0;
  }
};

const groupedLimits = (schema: VisualConfigSchema) => {
  const groups = new Map<string, { min: number; max?: number; slots: FieldSlotSchema[] }>();
  schema.fieldSlots
    .filter(slot => slot.type !== 'filter')
    .forEach(slot => {
      const key = slot.type === 'custom' ? slot.key : slot.type;
      const current = groups.get(key) || { min: 0, max: 0, slots: [] };
      current.min += slot.required ? slot.min ?? 1 : slot.min ?? 0;
      if (typeof slot.max === 'number') {
        current.max = (current.max || 0) + slot.max;
      } else {
        current.max = undefined;
      }
      current.slots.push(slot);
      groups.set(key, current);
    });
  return groups;
};

export const validateVisualSpec = (
  spec: ChartSpec,
  schema?: VisualConfigSchema,
): FieldSlotValidationResult[] => {
  if (!schema) return [];
  const groups = groupedLimits(schema);
  const results: FieldSlotValidationResult[] = [];

  groups.forEach(({ min, max, slots }) => {
    const count = countBindings(spec, slots[0]);
    const valid = count >= min && (typeof max !== 'number' || count <= max);
    const label = slots.map(slot => slot.label).join(' / ');
    results.push({
      slot: { ...slots[0], label, min, max, required: min > 0 },
      count,
      valid,
      message: valid
        ? undefined
        : count < min
        ? `${label} 至少需要 ${min} 个字段，当前 ${count} 个`
        : `${label} 最多允许 ${max} 个字段，当前 ${count} 个`,
    });
  });

  return results;
};

export const isVisualSpecValid = (spec: ChartSpec, schema?: VisualConfigSchema) =>
  validateVisualSpec(spec, schema).every(result => result.valid);
