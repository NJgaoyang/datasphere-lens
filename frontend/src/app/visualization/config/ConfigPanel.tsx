import { Collapse } from 'antd';
import { GroupLayout, ItemLayout } from 'app/components/FormGenerator';
import { FormGroupLayoutMode } from 'app/components/FormGenerator/constants';
import { ChartDataConfig, ChartStyleConfig } from 'app/types/ChartConfig';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { VisualConfigSchema } from './ConfigSchema';
import {
  countConfigLeaves,
  getDefaultExpandedConfigKeys,
  getVisibleConfigItems,
} from './configPanelUtils';

export type ConfigSection = 'styles' | 'settings' | 'interactions';

export interface ConfigPanelProps {
  schema: VisualConfigSchema;
  section?: ConfigSection;
  dataConfigs?: ChartDataConfig[];
  context?: any;
  translate?: (key: string, disablePrefix?: boolean, options?: any) => string;
  onChange: (
    ancestors: number[],
    config: ChartStyleConfig,
    needRefresh?: boolean,
  ) => void;
}

const ConfigPanel: FC<ConfigPanelProps> = ({
  schema,
  section = 'styles',
  dataConfigs,
  context,
  translate = value => value,
  onChange,
}) => {
  const configs = schema[section] || [];
  const visibleConfigs = useMemo(
    () => getVisibleConfigItems(configs),
    [configs],
  );
  const defaultActiveKeys = useMemo(
    () => getDefaultExpandedConfigKeys(configs),
    [configs],
  );
  const standaloneConfigs = visibleConfigs.filter(item => item.comType !== 'group');
  const groupConfigs = visibleConfigs.filter(item => item.comType === 'group');

  return (
    <PanelShell>
      {standaloneConfigs.length > 0 && (
        <QuickSettings>
          <QuickSettingsTitle>常用设置</QuickSettingsTitle>
          {standaloneConfigs.map(item => {
            const index = configs.findIndex(config => config === item);
            return (
              <ItemLayout
                key={item.key}
                ancestors={[index]}
                data={item}
                translate={translate}
                dataConfigs={dataConfigs}
                onChange={onChange}
                context={context}
              />
            );
          })}
        </QuickSettings>
      )}
      <StyledCollapse
        className="lens-config-panel"
        ghost
        expandIconPosition="end"
        defaultActiveKey={defaultActiveKeys}
      >
      {groupConfigs.map(item => {
        const index = configs.findIndex(config => config === item);
        if (item.comType === 'group') {
          return (
            <Collapse.Panel
              header={
                <GroupHeader>
                  <span>{translate(item.label, true)}</span>
                  <em>{countConfigLeaves(item)} 项</em>
                </GroupHeader>
              }
              key={item.key}
            >
              <GroupLayout
                ancestors={[index]}
                mode={FormGroupLayoutMode.INNER}
                data={item}
                translate={translate}
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
    </PanelShell>
  );
};

const PanelShell = styled.div`
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

export default ConfigPanel;
