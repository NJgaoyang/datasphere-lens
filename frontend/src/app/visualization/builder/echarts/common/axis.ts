export interface AxisOptions {
  show?: boolean;
  inverse?: boolean;
  name?: string;
}

export const buildCategoryAxis = (data: unknown[], options: AxisOptions = {}) => ({
  type: 'category',
  show: options.show !== false,
  inverse: Boolean(options.inverse),
  name: options.name,
  data,
});

export const buildValueAxis = (options: AxisOptions = {}) => ({
  type: 'value',
  show: options.show !== false,
  inverse: Boolean(options.inverse),
  name: options.name,
});
