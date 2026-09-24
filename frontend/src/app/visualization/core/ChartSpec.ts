export const CHART_SPEC_VERSION = 1;

export type AggregateType =
  | 'SUM'
  | 'AVG'
  | 'COUNT'
  | 'COUNT_DISTINCT'
  | 'MAX'
  | 'MIN';

export interface FieldBinding {
  fieldId: string;
  fieldName?: string;
  alias?: string;
  aggregate?: AggregateType | string;
}

export interface ChartFilterSpec {
  fieldId: string;
  operator: string;
  value?: unknown;
}

export interface ChartSortSpec {
  fieldId: string;
  direction: 'ASC' | 'DESC';
}
export interface ChartEncodingSpec {
  x?: FieldBinding[];
  y?: FieldBinding[];
  color?: FieldBinding[];
  size?: FieldBinding[];
  series?: FieldBinding[];
  label?: FieldBinding[];
  [key: string]: FieldBinding[] | undefined;
}

export interface ChartInteractionSpec {
  drill?: Record<string, unknown>;
  linkage?: Record<string, unknown>;
  tooltip?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChartSpec<TOptions = Record<string, unknown>> {
  version: number;
  type: string;
  datasetId?: string;
  dimensions: FieldBinding[];
  measures: FieldBinding[];
  filters?: ChartFilterSpec[];
  sorts?: ChartSortSpec[];
  encoding?: ChartEncodingSpec;
  options?: TOptions;
  interactions?: ChartInteractionSpec;
}
