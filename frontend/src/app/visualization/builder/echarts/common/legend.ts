export interface LegendOptions {
  show?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const buildLegend = (options: LegendOptions = {}) => ({
  show: options.show !== false,
  orient: options.position === 'left' || options.position === 'right' ? 'vertical' : 'horizontal',
  ...(options.position ? { [options.position]: 0 } : {}),
});
