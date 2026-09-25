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

import { Collapse, Empty, Input } from 'antd';
import { ItemLayout } from 'app/components/FormGenerator';
import { FormGroupLayoutMode } from 'app/components/FormGenerator/constants';
import GroupLayout from 'app/components/FormGenerator/Layout/GroupLayout';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { ChartDataConfig, ChartStyleConfig } from 'app/types/ChartConfig';
import {
  countConfigLeaves,
  getDefaultExpandedConfigKeys,
  getVisibleConfigItems,
  matchesConfigQuery,
} from 'app/visualization/config/configPanelUtils';
import { FC, memo, useMemo, useState } from 'react';
import styled from 'styled-components';


const describeGroup = (key = '', label = '') => {
  const text = `${key} ${label}`.toLowerCase();
  if (/title|header/.test(text)) return '控制图表标题、说明与标题区域展示';
  if (/legend/.test(text)) return '控制图例位置、方向与显示方式';
  if (/axis|xaxis|yaxis/.test(text)) return '控制坐标轴、刻度、网格线与轴标题';
  if (/label/.test(text)) return '控制数据标签内容、位置与显示格式';
  if (/tooltip/.test(text)) return '控制鼠标悬停时的数据提示内容';
  if (/color|theme|palette/.test(text)) return '控制图表主题、配色与视觉风格';
  if (/animation/.test(text)) return '控制图表加载与数据变化动画';
  if (/drill|link|interaction|zoom/.test(text)) return '控制钻取、联动、缩放等分析行为';
  if (/grid|layout|margin/.test(text)) return '控制绘图区布局、留白与间距';
  return '配置这一组的展示与行为参数';
};

const ChartStyleConfigPanel: FC<{
  configs?: ChartStyleConfig[];
  dataConfigs?: ChartDataConfig[];
  i18nPrefix: string;
  context?: any;
  onChange: (
    ancestors: number[],
    config: ChartStyleConfig,
    needRefresh?: boolean,
  ) => void;
}> = memo(
  ({ configs, dataConfigs, i18nPrefix, context, onChange }) => {
    const t = useI18NPrefix(i18nPrefix);
    const [searchValue, setSearchValue] = useState('');
    const visibleConfigs = useMemo(
      () =>
        getVisibleConfigItems(configs).filter(config =>
          matchesConfigQuery(config, searchValue, label => t(label || '', true)),
        ),
      [configs, searchValue, t],
    );
    const defaultActiveKeys = useMemo(
      () => getDefaultExpandedConfigKeys(configs),
      [configs],
    );
    const standaloneConfigs = visibleConfigs.filter(c => c.comType !== 'group');
    const groupConfigs = visibleConfigs.filter(c => c.comType === 'group');

    return (
      <ConfigPanelShell>
        <ConfigSearch>
          <Input.Search
            allowClear
            size="small"
            value={searchValue}
            placeholder="搜索配置项"
            onChange={event => setSearchValue(event.target.value)}
          />
        </ConfigSearch>
        {standaloneConfigs.length > 0 && (
          <QuickSettings>
            <QuickSettingsTitle>常用设置</QuickSettingsTitle>
            {standaloneConfigs.map(c => {
              const index = configs?.findIndex(item => item === c) ?? -1;
              return (
                <ItemLayout
                  key={c.key}
                  ancestors={[index]}
                  data={c}
                  translate={t}
                  dataConfigs={dataConfigs}
                  onChange={onChange}
                  context={context}
                />
              );
            })}
          </QuickSettings>
        )}
        {visibleConfigs.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的配置项" />
        )}
        <StyledCollapse
          key={searchValue || 'default'}
          className="lens-config-panel"
          ghost
          expandIconPosition="end"
          defaultActiveKey={
            searchValue ? groupConfigs.map(config => config.key) : defaultActiveKeys
          }
        >
        {groupConfigs.map(c => {
            const index = configs?.findIndex(item => item === c) ?? -1;
            if (c.comType === 'group') {
              return (
                <Collapse.Panel
                  header={
                    <GroupHeader>
                      <GroupHeaderText>
                        <span>{t(c.label, true)}</span>
                        <small>{describeGroup(c.key, t(c.label, true))}</small>
                      </GroupHeaderText>
                      <em>{countConfigLeaves(c)} 项</em>
                    </GroupHeader>
                  }
                  key={c.key}
                >
                  <GroupLayout
                    ancestors={[index]}
                    mode={FormGroupLayoutMode.INNER}
                    data={c}
                    translate={t}
                    dataConfigs={dataConfigs}
                    onChange={onChange}
                    context={context}
                    flatten
                  />
                </Collapse.Panel>
              );
            }
            return null;
          })}
        </StyledCollapse>
      </ConfigPanelShell>
    );
  },
  (prev, next) =>
    prev.configs === next.configs && prev.dataConfigs === next.dataConfigs,
);

export default ChartStyleConfigPanel;


const ConfigPanelShell = styled.div`
  padding-bottom: 8px;
`;

const QuickSettings = styled.section`
  padding: 10px 0 4px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const QuickSettingsTitle = styled.div`
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-item {
    border-bottom: 1px solid ${p => p.theme.borderColorSplit};
  }

  .ant-collapse-header {
    padding: 10px 0 !important;
  }

  .ant-collapse-content-box {
    padding: 0 0 8px !important;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColor};

  em {
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    color: ${p => p.theme.textColorDisabled};
  }
`;

const GroupHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  small {
    overflow: hidden;
    font-size: 10px;
    font-weight: 400;
    color: ${p => p.theme.textColorDisabled};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ConfigSearch = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 0;
  background: ${p => p.theme.componentBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;
