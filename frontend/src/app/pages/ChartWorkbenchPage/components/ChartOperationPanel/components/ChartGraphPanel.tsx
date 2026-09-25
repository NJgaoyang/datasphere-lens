/**
 * Datart
 * Licensed under the Apache License, Version 2.0.
 */

import ChartManager from 'app/models/ChartManager';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import { IChart } from 'app/types/Chart';
import { visualPluginToChart } from 'app/visualization/adapters/VisualPluginChartAdapter';
import { ChartConfig } from 'app/types/ChartConfig';
import {
  chartRegistry,
  VisualCategory,
} from 'app/visualization/registry/ChartRegistry';
import { transferChartDataConfig } from 'app/utils/internalChartHelper';
import { FC, memo, useLayoutEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BORDER_RADIUS, SPACE_MD, SPACE_XS } from 'styles/StyleConstants';
import { CloneValueDeep } from 'utils/object';
import ChartGraphIcon from './ChartGraphIcon';

const CATEGORY_ORDER: VisualCategory[] = [
  'table',
  'indicator',
  'comparison',
  'trend',
  'distribution',
  'relationship',
  'map',
  'custom',
];

const CATEGORY_LABELS: Record<VisualCategory, string> = {
  table: '表格',
  indicator: '指标',
  comparison: '比较',
  trend: '趋势',
  distribution: '分布',
  relationship: '关系',
  map: '地图',
  custom: '其他',
};

const ChartGraphPanel: FC<{
  chart?: IChart;
  chartConfig?: ChartConfig;
  onChartChange: (chart: IChart) => void;
}> = memo(({ chart, chartConfig, onChartChange }) => {
  ChartManager.instance();
  const plugins = useMemo(
    () => chartRegistry.query(),
    [],
  );
  const [requirementsStates, setRequirementStates] = useState<object>({});
  const groupedPlugins = useMemo(
    () =>
      CATEGORY_ORDER.map(category => ({
        category,
        plugins: plugins.filter(plugin => plugin.category === category),
      })).filter(group => group.plugins.length > 0),
    [plugins],
  );

  useLayoutEffect(() => {
    const dict = plugins.reduce((acc, plugin) => {
      const current = visualPluginToChart(plugin);
      const transferred = transferChartDataConfig(
        { datas: CloneValueDeep(current?.config?.datas || []) },
        { datas: chartConfig?.datas },
      );
      acc[plugin.type] = current?.isMatchRequirement(transferred);
      return acc;
    }, {});
    setRequirementStates(dict);
  }, [chartConfig, plugins]);

  return (
    <StyledChartGraphPanel>
      {groupedPlugins.map(group => (
        <CategoryGroup key={group.category} data-category={group.category}>
          <CategoryTitle>{CATEGORY_LABELS[group.category]}</CategoryTitle>
          <CategoryIcons>
            {group.plugins.map(plugin => {
              const current = visualPluginToChart(plugin);
              return (
                <ChartI18NContext.Provider
                  key={plugin.type}
                  value={{ i18NConfigs: current.config?.i18ns }}
                >
                  <ChartGraphIcon
                    chart={current}
                    isActive={plugin.type === chart?.meta?.id}
                    isMatchRequirement={!!requirementsStates?.[plugin.type]}
                    onChartChange={onChartChange}
                  />
                </ChartI18NContext.Provider>
              );
            })}
          </CategoryIcons>
        </CategoryGroup>
      ))}
    </StyledChartGraphPanel>
  );
});

export default ChartGraphPanel;

const StyledChartGraphPanel = styled.div`
  padding: 8px 10px 10px;
  margin-bottom: ${SPACE_MD};
  color: ${p => p.theme.textColorLight};
  background: ${p => p.theme.componentBackground};
  border: 1px solid ${p => p.theme.borderColorSplit};
  border-radius: ${BORDER_RADIUS};
`;

const CategoryGroup = styled.div`
  & + & {
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid ${p => p.theme.borderColorSplit};
  }
`;

const CategoryTitle = styled.div`
  padding: 0 2px 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${p => p.theme.textColorSnd};
`;

const CategoryIcons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 34px);
  gap: 6px;
`;
