/**
 * Datart
 * Licensed under the Apache License, Version 2.0.
 */

import { Segmented, Space, Typography, theme } from 'antd';
import ChartManager from 'app/models/ChartManager';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import { IChart } from 'app/types/Chart';
import { ChartConfig } from 'app/types/ChartConfig';
import { visualPluginToChart } from 'app/visualization/adapters/VisualPluginChartAdapter';
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

type GalleryCategory = 'all' | VisualCategory;

const CATEGORY_META: Array<{ value: GalleryCategory; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'table', label: '表格' },
  { value: 'indicator', label: '指标' },
  { value: 'comparison', label: '比较' },
  { value: 'trend', label: '趋势' },
  { value: 'distribution', label: '分布' },
  { value: 'relationship', label: '关系' },
  { value: 'map', label: '地图' },
  { value: 'custom', label: '其他' },
];

const ChartGraphPanel: FC<{
  chart?: IChart;
  chartConfig?: ChartConfig;
  onChartChange: (chart: IChart) => void;
}> = memo(({ chart, chartConfig, onChartChange }) => {
  ChartManager.instance();
  const { token } = theme.useToken();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const plugins = useMemo(() => chartRegistry.query(), []);
  const [requirementsStates, setRequirementStates] = useState<
    Record<string, boolean>
  >({});

  const availableCategories = useMemo(() => {
    const existing = new Set(plugins.map(plugin => plugin.category));
    return CATEGORY_META.filter(
      item =>
        item.value === 'all' || existing.has(item.value as VisualCategory),
    );
  }, [plugins]);

  const visiblePlugins = useMemo(
    () =>
      activeCategory === 'all'
        ? plugins
        : plugins.filter(plugin => plugin.category === activeCategory),
    [activeCategory, plugins],
  );

  useLayoutEffect(() => {
    const dict = plugins.reduce<Record<string, boolean>>((acc, plugin) => {
      const current = visualPluginToChart(plugin);
      const transferred = transferChartDataConfig(
        { datas: CloneValueDeep(current?.config?.datas || []) },
        { datas: chartConfig?.datas },
      );
      acc[plugin.type] = Boolean(current?.isMatchRequirement(transferred));
      return acc;
    }, {});
    setRequirementStates(dict);
  }, [chartConfig, plugins]);

  return (
    <StyledChartGraphPanel>
      <GalleryHeader>
        <div>
          <Typography.Text strong style={{ fontSize: 12 }}>
            图表库
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ marginLeft: 8, fontSize: 11 }}
          >
            {plugins.length} 个可视化
          </Typography.Text>
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 10 }}>
          Registry 驱动
        </Typography.Text>
      </GalleryHeader>

      <CategoryScroller>
        <Segmented
          size="small"
          value={activeCategory}
          onChange={value => setActiveCategory(value as GalleryCategory)}
          options={availableCategories}
          style={{ background: token.colorFillQuaternary }}
        />
      </CategoryScroller>

      <VisualGrid>
        {visiblePlugins.map(plugin => {
          const current = visualPluginToChart(plugin);
          const isV2 = !plugin.legacyChart || plugin.type.endsWith('-v2');
          return (
            <ChartI18NContext.Provider
              key={plugin.type}
              value={{ i18NConfigs: current.config?.i18ns }}
            >
              <ChartGraphIcon
                chart={current}
                displayName={plugin.name}
                isV2={isV2}
                isActive={plugin.type === chart?.meta?.id}
                isMatchRequirement={Boolean(requirementsStates[plugin.type])}
                onChartChange={onChartChange}
              />
            </ChartI18NContext.Provider>
          );
        })}
      </VisualGrid>
    </StyledChartGraphPanel>
  );
});

export default ChartGraphPanel;

const StyledChartGraphPanel = styled.div`
  padding: ${SPACE_XS};
  margin-bottom: ${SPACE_MD};
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: ${BORDER_RADIUS};
  box-shadow: 0 4px 14px rgba(16, 24, 40, 0.04);
`;

const GalleryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px 7px;
`;

const CategoryScroller = styled.div`
  padding: 0 4px 8px;
  overflow-x: auto;
  white-space: nowrap;
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 6px;
  max-height: 178px;
  padding: 2px 4px 4px;
  overflow-y: auto;
`;
