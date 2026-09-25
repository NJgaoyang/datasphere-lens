import { ChartStyleConfig } from 'app/types/ChartConfig';

export type VisualStylePreset = 'minimal' | 'business' | 'emphasis';
export type VisualStylePatch = {
  ancestors: number[];
  config: ChartStyleConfig;
};

const PRESETS: Record<VisualStylePreset, Record<string, unknown>> = {
  minimal: {
    showLabel: false,
    showTooltip: true,
    animation: false,
    showTitle: false,
    showXAxis: true,
    showYAxis: true,
    roam: false,
  },
  business: {
    showLabel: false,
    labelFontSize: 12,
    showTooltip: true,
    animation: true,
    showTitle: false,
    showXAxis: true,
    showYAxis: true,
    roam: true,
  },
  emphasis: {
    showLabel: true,
    labelFontSize: 14,
    showTooltip: true,
    animation: true,
    showTitle: true,
    showXAxis: true,
    showYAxis: true,
    roam: true,
  },
};

export function getVisualStylePresetPatches(
  configs: ChartStyleConfig[] = [],
  preset: VisualStylePreset,
): VisualStylePatch[] {
  const values = PRESETS[preset];
  const patches: VisualStylePatch[] = [];

  const visit = (rows: ChartStyleConfig[], ancestors: number[]) => {
    rows.forEach((row, index) => {
      const path = [...ancestors, index];
      if (row.rows?.length) {
        visit(row.rows as ChartStyleConfig[], path);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(values, row.key)) {
        patches.push({
          ancestors: path,
          config: { ...row, value: values[row.key] },
        });
      }
    });
  };

  visit(configs, []);
  return patches;
}
