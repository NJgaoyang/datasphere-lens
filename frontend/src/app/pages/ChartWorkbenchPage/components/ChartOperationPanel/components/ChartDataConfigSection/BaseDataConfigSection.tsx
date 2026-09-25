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

import { ChartDataSectionType } from 'app/constants';
import { ChartDataConfigSectionProps } from 'app/types/ChartDataConfigSection';
import { FC, memo } from 'react';
import styled from 'styled-components';
import { ChartDraggableTargetContainer } from '../ChartDraggable';
import { dataConfigSectionComparer } from './utils';

const SECTION_TYPE_LABELS: Record<string, string> = {
  [ChartDataSectionType.Group]: '维度',
  [ChartDataSectionType.Aggregate]: '度量',
  [ChartDataSectionType.Mixed]: '字段',
  [ChartDataSectionType.Filter]: '筛选',
  [ChartDataSectionType.Color]: '颜色',
  [ChartDataSectionType.Size]: '大小',
  [ChartDataSectionType.Info]: '信息',
};

const getUpperBound = (limit: ChartDataConfigSectionProps['config']['limit']) => {
  if (typeof limit === 'number') return limit;
  if (Array.isArray(limit) && typeof limit[1] === 'number') return limit[1];
  return undefined;
};

const BaseDataConfigSection: FC<ChartDataConfigSectionProps> = memo(
  ({ modalSize, config, extra, translate = title => title, ...rest }) => {
    return (
      <StyledBaseDataConfigSection>
        <StyledBaseDataConfigSectionTitle>
          <TitleMain>
            <span>
              {translate(config.label || '') +
                (config?.drillable ? ` (${translate('drillable')})` : '')}
            </span>
            <SemanticBadge>
              {SECTION_TYPE_LABELS[config.type || ''] || '字段'}
            </SemanticBadge>
            {config.required ? <RequiredBadge>必填</RequiredBadge> : null}
          </TitleMain>
          <TitleMeta>
            {config.rows?.length || 0}
            {getUpperBound(config.limit) !== undefined
              ? ` / ${getUpperBound(config.limit)}`
              : ''}
          </TitleMeta>
          {extra?.()}
        </StyledBaseDataConfigSectionTitle>
        <ChartDraggableTargetContainer
          {...rest}
          translate={translate}
          modalSize={modalSize}
          config={config}
        />
      </StyledBaseDataConfigSection>
    );
  },
  dataConfigSectionComparer,
);

export default BaseDataConfigSection;

const StyledBaseDataConfigSection = styled.div`
  padding: 8px 0 4px;
`;

const StyledBaseDataConfigSectionTitle = styled.div`
  display: flex;
  align-items: center;
  min-height: 26px;
  padding: 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  user-select: none;
`;

const TitleMain = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
`;

const SemanticBadge = styled.span`
  padding: 0 5px;
  font-size: 10px;
  font-weight: 500;
  line-height: 18px;
  color: ${p => p.theme.info};
  background: ${p => p.theme.info}10;
  border-radius: 3px;
`;

const RequiredBadge = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${p => p.theme.error};
`;

const TitleMeta = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: ${p => p.theme.textColorDisabled};
`;
