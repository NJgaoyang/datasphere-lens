import { ChartStyleConfig, ChartStyleSectionGroup } from 'app/types/ChartConfig';

export const getVisibleConfigItems = (configs: ChartStyleConfig[] = []) =>
  configs.filter(item => !item.hidden);

export const countConfigLeaves = (config?: ChartStyleSectionGroup): number => {
  if (!config) return 0;
  const rows = (config.rows || []).filter(row => !row.hidden);
  if (!rows.length) return 1;
  return rows.reduce((count, row) => count + countConfigLeaves(row), 0);
};

export const getDefaultExpandedConfigKeys = (
  configs: ChartStyleConfig[] = [],
  limit = 2,
) =>
  getVisibleConfigItems(configs)
    .filter(item => item.comType === 'group')
    .slice(0, limit)
    .map(item => item.key);

export const matchesConfigQuery = (
  config: ChartStyleConfig,
  query: string,
  resolveLabel: (label?: string) => string = label => label || '',
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const ownText = `${config.key || ''} ${resolveLabel(config.label)}`.toLowerCase();
  if (ownText.includes(normalized)) return true;
  if (config.comType !== 'group') return false;
  return (config.rows || []).some(row =>
    matchesConfigQuery(row, normalized, resolveLabel),
  );
};
