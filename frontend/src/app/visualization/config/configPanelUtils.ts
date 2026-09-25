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
