import {
  ChartConfig,
  ChartDataConfig,
  ChartStyleConfig,
} from 'app/types/ChartConfig';
import { ChartSpec } from '../core/ChartSpec';

export type FieldSlotType =
  | 'dimension'
  | 'measure'
  | 'filter'
  | 'color'
  | 'size'
  | 'series'
  | 'label'
  | 'custom';

export interface FieldSlotSchema {
  key: string;
  label: string;
  type: FieldSlotType;
  required?: boolean;
  min?: number;
  max?: number;
  allowSameField?: boolean;
  drillable?: boolean;
}

export interface VisualConfigSchema {
  fieldSlots: FieldSlotSchema[];
  styles: ChartStyleConfig[];
  settings: ChartStyleConfig[];
  interactions: ChartStyleConfig[];
  legacy?: ChartConfig;
}
const mapLegacySlotType = (config: ChartDataConfig): FieldSlotType => {
  if (config.key === 'filter' || config.type === 'filter') return 'filter';
  if (config.key === 'color' || config.type === 'color') return 'color';
  if (config.type === 'aggregate') return 'measure';
  if (config.type === 'group') return 'dimension';
  return 'custom';
};

const parseLimit = (limit?: ChartDataConfig['limit']) => {
  if (!Array.isArray(limit)) return {};
  const [min, max] = limit;
  return {
    min: typeof min === 'number' ? min : undefined,
    max: typeof max === 'number' ? max : undefined,
  };
};

export const fromLegacyChartConfig = (
  config: ChartConfig = {},
): VisualConfigSchema => ({
  fieldSlots: (config.datas || []).map(item => ({
    key: item.key,
    label: item.label || item.key,
    type: mapLegacySlotType(item),
    required: item.required,
    allowSameField: item.allowSameField,
    drillable: item.drillable,
    ...parseLimit(item.limit),
  })),
  styles: config.styles || [],
  settings: config.settings || [],
  interactions: config.interactions || [],
  legacy: config,
});
