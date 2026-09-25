/**
 * Datart
 * Licensed under the Apache License, Version 2.0.
 */

import {
  AppstoreOutlined,
  HistoryOutlined,
  MoreOutlined,
  SearchOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Segmented, Space, Typography, theme } from 'antd';
import ChartManager from 'app/models/ChartManager';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import { IChart } from 'app/types/Chart';
import { ChartConfig } from 'app/types/ChartConfig';
import { visualPluginToChart } from 'app/visualization/adapters/VisualPluginChartAdapter';
import {
  chartRegistry,
  VisualCategory,
  VisualPluginDefinition,
} from 'app/visualization/registry/ChartRegistry';
import { transferChartDataConfig } from 'app/utils/internalChartHelper';
import { FC, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BORDER_RADIUS, SPACE_MD, SPACE_XS } from 'styles/StyleConstants';
import { CloneValueDeep } from 'utils/object';
import ChartGraphIcon from './ChartGraphIcon';

type GalleryCategory = 'all' | 'favorites' | 'recent' | VisualCategory;

const FAVORITES_KEY = 'datasphere.visualGallery.favorites';
const RECENT_KEY = 'datasphere.visualGallery.recent';
const MAX_RECENT = 8;

const CATEGORY_META: Array<{ value: GalleryCategory; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'favorites', label: '常用' },
  { value: 'recent', label: '最近' },
  { value: 'table', label: '表格' },
  { value: 'indicator', label: '指标' },
  { value: 'comparison', label: '比较' },
  { value: 'trend', label: '趋势' },
  { value: 'distribution', label: '分布' },
  { value: 'relationship', label: '关系' },
  { value: 'map', label: '地图' },
  { value: 'custom', label: '其他' },
];

const readStorage = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const ChartGraphPanel: FC<{
  chart?: IChart;
  chartConfig?: ChartConfig;
  onChartChange: (chart: IChart) => void;
}> = memo(({ chart, chartConfig, onChartChange }) => {
  ChartManager.instance();
  const { token } = theme.useToken();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [searchText, setSearchText] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY));
  const [recent, setRecent] = useState<string[]>(() => readStorage(RECENT_KEY));
  const plugins = useMemo(() => chartRegistry.query(), []);
  const [requirementsStates, setRequirementStates] = useState<Record<string, boolean>>({});

  const availableCategories = useMemo(() => {
    const existing = new Set(plugins.map(plugin => plugin.category));
    return CATEGORY_META.filter(item =>
      ['all', 'favorites', 'recent'].includes(item.value) ||
      existing.has(item.value as VisualCategory),
    );
  }, [plugins]);

  const filterPlugins = useCallback(
    (items: VisualPluginDefinition[], category: GalleryCategory, keyword: string) => {
      const normalized = keyword.trim().toLowerCase();
      let result = items;
      if (category === 'favorites') {
        result = result.filter(plugin => favorites.includes(plugin.type));
      } else if (category === 'recent') {
        const map = new Map(result.map(plugin => [plugin.type, plugin]));
        result = recent.map(type => map.get(type)).filter(Boolean) as VisualPluginDefinition[];
      } else if (category !== 'all') {
        result = result.filter(plugin => plugin.category === category);
      }
      if (!normalized) return result;
      return result.filter(plugin =>
        `${plugin.name} ${plugin.type}`.toLowerCase().includes(normalized),
      );
    },
    [favorites, recent],
  );

  const visiblePlugins = useMemo(
    () => filterPlugins(plugins, activeCategory, searchText),
    [activeCategory, filterPlugins, plugins, searchText],
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

  const selectPlugin = useCallback(
    (plugin: VisualPluginDefinition) => {
      const current = visualPluginToChart(plugin);
      const nextRecent = [plugin.type, ...recent.filter(type => type !== plugin.type)].slice(0, MAX_RECENT);
      setRecent(nextRecent);
      localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
      onChartChange(CloneValueDeep(current));
      setMoreOpen(false);
    },
    [onChartChange, recent],
  );

  const toggleFavorite = useCallback((type: string) => {
    setFavorites(current => {
      const next = current.includes(type)
        ? current.filter(item => item !== type)
        : [...current, type];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renderPlugins = (items: VisualPluginDefinition[], expanded = false) => (
    <VisualGrid className={expanded ? 'expanded' : undefined}>
      {items.map(plugin => {
        const current = visualPluginToChart(plugin);
        const isV2 = !plugin.legacyChart || plugin.type.endsWith('-v2');
        return (
          <ChartI18NContext.Provider
            key={plugin.type}
            value={{ i18NConfigs: current.config?.i18ns }}
          >
            <ChartGraphIcon
              chart={current}
              pluginType={plugin.type}
              displayName={plugin.name}
              isV2={isV2}
              isFavorite={favorites.includes(plugin.type)}
              isActive={plugin.type === chart?.meta?.id}
              isMatchRequirement={Boolean(requirementsStates[plugin.type])}
              onFavoriteToggle={() => toggleFavorite(plugin.type)}
              onChartChange={() => selectPlugin(plugin)}
            />
          </ChartI18NContext.Provider>
        );
      })}
      {!items.length && <EmptyState>没有符合条件的图表</EmptyState>}
    </VisualGrid>
  );

  return (
    <StyledChartGraphPanel>
      <GalleryHeader>
        <Space size={6}>
          <AppstoreOutlined style={{ color: token.colorPrimary }} />
          <Typography.Text strong style={{ fontSize: 12 }}>图表库</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {plugins.length} 个可视化
          </Typography.Text>
        </Space>
        <Space size={4}>
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>Registry 驱动</Typography.Text>
          <Button type="text" size="small" icon={<MoreOutlined />} onClick={() => setMoreOpen(true)}>
            更多图表
          </Button>
        </Space>
      </GalleryHeader>

      <GalleryToolbar>
        <Input
          allowClear
          size="small"
          prefix={<SearchOutlined />}
          placeholder="搜索图表"
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
        />
        <Button
          size="small"
          type={activeCategory === 'favorites' ? 'primary' : 'default'}
          icon={<StarOutlined />}
          onClick={() => setActiveCategory('favorites')}
        >
          常用 {favorites.length || ''}
        </Button>
        <Button
          size="small"
          type={activeCategory === 'recent' ? 'primary' : 'default'}
          icon={<HistoryOutlined />}
          onClick={() => setActiveCategory('recent')}
        >
          最近
        </Button>
      </GalleryToolbar>

      <CategoryScroller>
        <Segmented
          size="small"
          value={activeCategory}
          onChange={value => setActiveCategory(value as GalleryCategory)}
          options={availableCategories.filter(item => !['favorites', 'recent'].includes(item.value))}
          style={{ background: token.colorFillQuaternary }}
        />
      </CategoryScroller>

      {renderPlugins(visiblePlugins)}

      <Modal
        open={moreOpen}
        width={820}
        footer={null}
        title={`更多图表 · ${plugins.length} 个可视化`}
        onCancel={() => setMoreOpen(false)}
      >
        <ModalToolbar>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索全部图表"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
          />
        </ModalToolbar>
        {renderPlugins(filterPlugins(plugins, 'all', searchText), true)}
      </Modal>
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

const GalleryToolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 1fr) auto auto;
  gap: 6px;
  padding: 0 4px 8px;
`;

const CategoryScroller = styled.div`
  padding: 0 4px 8px;
  overflow-x: auto;
  white-space: nowrap;
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  gap: 6px;
  max-height: 190px;
  padding: 2px 4px 4px;
  overflow-y: auto;

  &.expanded {
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    max-height: 520px;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 24px 8px;
  font-size: 12px;
  color: ${p => p.theme.textColorLight};
  text-align: center;
`;

const ModalToolbar = styled.div`
  margin-bottom: 12px;
`;
