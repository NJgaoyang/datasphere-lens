/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Badge, Tooltip, Typography } from 'antd';
import { ChartDataSectionType } from 'app/constants';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { IChart } from 'app/types/Chart';
import classnames from 'classnames';
import { FC, memo, useCallback } from 'react';
import { CloneValueDeep } from 'utils/object';
import styled from 'styled-components';
import { FONT_SIZE_ICON_MD } from 'styles/StyleConstants';

const ChartGraphIcon: FC<{
  chart?: IChart;
  isActive?: boolean;
  isMatchRequirement?: boolean;
  displayName?: string;
  isV2?: boolean;
  onChartChange: (chart: IChart) => void;
}> = memo(
  ({
    chart,
    isActive,
    isMatchRequirement,
    displayName,
    isV2,
    onChartChange,
  }) => {
    const t = useI18NPrefix(`viz.palette.graph`);

    const handleChartChange = useCallback(
      () => () => {
        if (chart) {
          onChartChange(CloneValueDeep(chart));
        }
      },
      [chart, onChartChange],
    );

    const renderIcon = ({
      ...args
    }: {
      iconStr;
      isMatchRequirement;
      isActive;
    }) => {
      if (/^<svg/.test(args?.iconStr) || /^<\?xml/.test(args?.iconStr)) {
        return <SVGImageRender {...args} />;
      }
      if (/svg\+xml;base64/.test(args?.iconStr)) {
        return <Base64ImageRender {...args} />;
      }
      return <SVGFontIconRender {...args} />;
    };

    const renderChartRequirements = requirements => {
      const lintMessages = requirements?.flatMap((requirement, index) => {
        return [ChartDataSectionType.Group, ChartDataSectionType.Aggregate].map(
          type => {
            const limit = requirement[type.toLocaleLowerCase()];
            const getMaxValueStr = limit =>
              !!limit && +limit >= 999 ? 'N' : limit;

            return (
              <li key={type + index}>
                {Number.isInteger(limit)
                  ? t('onlyAllow', undefined, {
                      type: t(type),
                      num: getMaxValueStr(limit),
                    })
                  : Array.isArray(limit) && limit.length === 2
                  ? t('allowRange', undefined, {
                      type: t(type),
                      start: limit?.[0],
                      end: getMaxValueStr(limit?.[1]),
                    })
                  : null}
              </li>
            );
          },
        );
      });
      return <ul>{lintMessages}</ul>;
    };

    return (
      <Tooltip
        key={chart?.meta?.id}
        title={
          <>
            {t(chart?.meta?.name!, true)}
            {renderChartRequirements(chart?.meta?.requirements)}
          </>
        }
      >
        <VisualTile
          className={classnames({
            active: isActive,
            disabled: !isMatchRequirement,
          })}
          onClick={isMatchRequirement ? handleChartChange() : undefined}
        >
          {isV2 && <V2Badge count="V2" />}
          <VisualIcon>
            {renderIcon({
              iconStr: chart?.meta?.icon,
              isMatchRequirement,
              isActive,
            })}
          </VisualIcon>
          <Typography.Text
            ellipsis
            style={{ width: '100%', fontSize: 10, textAlign: 'center' }}
          >
            {displayName || t(chart?.meta?.name!, true)}
          </Typography.Text>
        </VisualTile>
      </Tooltip>
    );
  },
);

export default ChartGraphIcon;

const SVGFontIconRender = ({ iconStr, isMatchRequirement }) => {
  return (
    <StyledSVGFontIcon
      isMatchRequirement={isMatchRequirement}
      className={`iconfont icon-${!iconStr ? 'chart' : iconStr}`}
    />
  );
};

const SVGImageRender = ({ iconStr, isMatchRequirement, isActive }) => {
  const encodedStr = window.encodeURIComponent(iconStr);
  return (
    <StyledInlineSVGIcon
      alt="svg icon"
      style={{ height: FONT_SIZE_ICON_MD, width: FONT_SIZE_ICON_MD }}
      src={`data:image/svg+xml;utf8,${encodedStr}`}
      isMatchRequirement={isMatchRequirement}
    />
  );
};

const Base64ImageRender = ({ iconStr, isMatchRequirement, isActive }) => {
  return (
    <StyledBase64Icon
      alt="svg icon"
      style={{ height: FONT_SIZE_ICON_MD, width: FONT_SIZE_ICON_MD }}
      src={iconStr}
      isMatchRequirement={isMatchRequirement}
    />
  );
};

const VisualTile = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 66px;
  padding: 7px 6px 5px;
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

const VisualIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-bottom: 4px;
  font-size: ${FONT_SIZE_ICON_MD};
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

const StyledInlineSVGIcon = styled.img<{ isMatchRequirement?: boolean }>`
  opacity: ${p => (p.isMatchRequirement ? 1 : 0.4)};
`;

const StyledSVGFontIcon = styled.i<{ isMatchRequirement?: boolean }>`
  opacity: ${p => (p.isMatchRequirement ? 1 : 0.4)};
`;

const StyledBase64Icon = styled.i<{
  isMatchRequirement?: boolean;
  alt: any;
  src: any;
}>`
  opacity: ${p => (p.isMatchRequirement ? 1 : 0.4)};
`;
