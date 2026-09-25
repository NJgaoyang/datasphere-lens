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

import { Collapse } from 'antd';
import { ItemLayout } from 'app/components/FormGenerator';
import { FormGroupLayoutMode } from 'app/components/FormGenerator/constants';
import GroupLayout from 'app/components/FormGenerator/Layout/GroupLayout';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { ChartDataConfig, ChartStyleConfig } from 'app/types/ChartConfig';
import {
  countConfigLeaves,
  getDefaultExpandedConfigKeys,
  getVisibleConfigItems,
} from 'app/visualization/config/configPanelUtils';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

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
    const visibleConfigs = useMemo(
      () => getVisibleConfigItems(configs),
      [configs],
    );
    const defaultActiveKeys = useMemo(
      () => getDefaultExpandedConfigKeys(configs),
      [configs],
    );
    const standaloneConfigs = visibleConfigs.filter(c => c.comType !== 'group');
    const groupConfigs = visibleConfigs.filter(c => c.comType === 'group');

    return (
      <ConfigPanelShell>
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
        <StyledCollapse
          className="datart-config-panel"
          ghost
          expandIconPosition="end"
          defaultActiveKey={defaultActiveKeys}
        >
        {groupConfigs.map(c => {
            const index = configs?.findIndex(item => item === c) ?? -1;
            if (c.comType === 'group') {
              return (
                <Collapse.Panel
                  header={
                    <GroupHeader>
                      <span>{t(c.label, true)}</span>
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
