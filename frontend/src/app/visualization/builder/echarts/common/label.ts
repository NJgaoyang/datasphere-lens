export interface LabelOptions {
  show?: boolean;
  position?: string;
}

export const buildLabel = (options: LabelOptions = {}) => ({
  show: Boolean(options.show),
  position: options.position || 'top',
});
