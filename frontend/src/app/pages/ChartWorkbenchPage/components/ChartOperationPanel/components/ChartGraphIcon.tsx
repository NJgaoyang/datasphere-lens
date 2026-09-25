/**
 * Datart
 * Licensed under the Apache License, Version 2.0.
 */

import {
  ApartmentOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  BoxPlotOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  DotChartOutlined,
  FundOutlined,
  GatewayOutlined,
  HeatMapOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  PartitionOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  StarFilled,
  StarOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Badge, Tooltip, Typography } from 'antd';
import { ChartDataSectionType } from 'app/constants';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { IChart } from 'app/types/Chart';
import classnames from 'classnames';
import { FC, memo, ReactNode } from 'react';
import styled from 'styled-components';
import { FONT_SIZE_ICON_MD } from 'styles/StyleConstants';

const iconByType = (type?: string): ReactNode => {
  if (!type) return undefined;
  if (type.includes('table') || type.includes('sheet')) return <TableOutlined />;
  if (type.includes('bar') || type.includes('column') || type.includes('waterfall')) return <BarChartOutlined />;
  if (type.includes('line')) return <LineChartOutlined />;
  if (type.includes('area')) return <AreaChartOutlined />;
  if (type.includes('pie') || type.includes('doughnut') || type.includes('rose')) return <PieChartOutlined />;
  if (type.includes('scatter')) return <DotChartOutlined />;
  if (type.includes('radar')) return <RadarChartOutlined />;
  if (type.includes('heatmap')) return <HeatMapOutlined />;
  if (type.includes('boxplot')) return <BoxPlotOutlined />;
  if (type.includes('sankey')) return <GatewayOutlined />;
  if (type.includes('sunburst')) return <PartitionOutlined />;
  if (type.includes('treemap')) return <ApartmentOutlined />;
  if (type.includes('tree-v2')) return <BranchesOutlined />;
  if (type.includes('graph-v2')) return <DeploymentUnitOutlined />;
  if (type.includes('funnel')) return <FundOutlined />;
  if (type.includes('double-y')) return <NodeIndexOutlined />;
  return undefined;
};

const ChartGraphIcon: FC<{
  chart?: IChart;
  pluginType?: string;
  isActive?: boolean;
  isMatchRequirement?: boolean;
  displayName?: string;
  isV2?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onChartChange: (chart: IChart) => void;
}> = memo(({
  chart,
  pluginType,
  isActive,
  isMatchRequirement,
  displayName,
  isV2,
  isFavorite,
  onFavoriteToggle,
  onChartChange,
}) => {
  const t = useI18NPrefix(`viz.palette.graph`);

  const renderIcon = () => {
    const mapped = iconByType(pluginType);
    if (mapped) return mapped;
    const iconStr = chart?.meta?.icon || '';
    if (/^<svg/.test(iconStr) || /^<\?xml/.test(iconStr)) {
      const encodedStr = window.encodeURIComponent(iconStr);
      return <StyledInlineSVGIcon alt="svg icon" src={`data:image/svg+xml;utf8,${encodedStr}`} />;
    }
    if (/svg\+xml;base64/.test(iconStr)) {
      return <StyledInlineSVGIcon alt="svg icon" src={iconStr} />;
    }
    return <i className={`iconfont icon-${!iconStr ? 'chart' : iconStr}`} />;
  };

  const renderChartRequirements = requirements => {
    const lintMessages = requirements?.flatMap((requirement, index) =>
      [ChartDataSectionType.Group, ChartDataSectionType.Aggregate].map(type => {
        const limit = requirement[type.toLocaleLowerCase()];
        const getMaxValueStr = value => !!value && +value >= 999 ? 'N' : value;
        return (
          <li key={type + index}>
            {Number.isInteger(limit)
              ? t('onlyAllow', undefined, { type: t(type), num: getMaxValueStr(limit) })
              : Array.isArray(limit) && limit.length === 2
              ? t('allowRange', undefined, {
                  type: t(type),
                  start: limit?.[0],
                  end: getMaxValueStr(limit?.[1]),
                })
              : null}
          </li>
        );
      }),
    );
    return <ul>{lintMessages}</ul>;
  };

  return (
    <Tooltip
      key={chart?.meta?.id}
      title={
        <>
          {displayName || t(chart?.meta?.name!, true)}
          {renderChartRequirements(chart?.meta?.requirements)}
        </>
      }
    >
      <VisualTile
        className={classnames({ active: isActive, disabled: !isMatchRequirement })}
        onClick={() => {
          if (chart && isMatchRequirement) onChartChange(chart);
        }}
      >
        <FavoriteButton
          className={isFavorite ? 'favorite' : undefined}
          onClick={event => {
            event.stopPropagation();
            onFavoriteToggle?.();
          }}
          title={isFavorite ? '取消常用' : '加入常用'}
        >
          {isFavorite ? <StarFilled /> : <StarOutlined />}
        </FavoriteButton>
        {isV2 && <V2Badge count="V2" />}
        <VisualIcon>{renderIcon()}</VisualIcon>
        <Typography.Text ellipsis style={{ width: '100%', fontSize: 10, textAlign: 'center' }}>
          {displayName || t(chart?.meta?.name!, true)}
        </Typography.Text>
      </VisualTile>
    </Tooltip>
  );
});

export default ChartGraphIcon;

const VisualTile = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  padding: 9px 6px 6px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 8px;
  transition: all 0.16s ease;

  &:hover {
    border-color: ${p => p.theme.primary};
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.12);
    transform: translateY(-1px);
  }

  &.active {
    background: ${p => p.theme.primary}0d;
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 2px ${p => p.theme.primary}1a;
  }

  &.disabled {
    cursor: not-allowed;
    filter: grayscale(0.5);
    opacity: 0.42;
  }

  &.disabled:hover {
    border-color: #eaecf0;
    box-shadow: none;
    transform: none;
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  padding: 0;
  color: #98a2b3;
  cursor: pointer;
  background: transparent;
  border: 0;
  opacity: 0;
  transition: opacity 0.15s ease;

  ${VisualTile}:hover &,
  &.favorite {
    opacity: 1;
  }

  &.favorite {
    color: #faad14;
  }
`;

const VisualIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-bottom: 4px;
  font-size: 22px;
  color: ${p => p.theme.textColorLight};

  .active & {
    color: ${p => p.theme.primary};
  }
`;

const V2Badge = styled(Badge)`
  position: absolute;
  top: 3px;
  right: 3px;

  .ant-badge-count {
    min-width: 20px;
    height: 14px;
    padding: 0 4px;
    font-size: 8px;
    line-height: 14px;
    box-shadow: none;
  }
`;

const StyledInlineSVGIcon = styled.img`
  width: ${FONT_SIZE_ICON_MD};
  height: ${FONT_SIZE_ICON_MD};
`;
