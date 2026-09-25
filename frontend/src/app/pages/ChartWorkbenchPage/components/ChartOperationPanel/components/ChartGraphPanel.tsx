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
          <CategoryTitle>{group.category}</CategoryTitle>
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
  padding: ${SPACE_XS};
  margin-bottom: ${SPACE_MD};
  color: ${p => p.theme.textColorLight};
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: ${BORDER_RADIUS};
  box-shadow: 0 4px 14px rgba(16, 24, 40, 0.03);
`;

const CategoryGroup = styled.div`
  & + & {
    margin-top: ${SPACE_XS};
  }
`;

const CategoryTitle = styled.div`
  padding: 4px 6px 2px;
  font-size: 11px;
  color: ${p => p.theme.textColorLight};
  text-transform: capitalize;
`;

const CategoryIcons = styled.div`
  display: flex;
  flex-flow: row wrap;
`;
