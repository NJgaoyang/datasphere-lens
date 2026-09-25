/**
 * Datart
 *
 * Copyright 2021
 */
import { Collapse } from 'antd';
import { ItemLayout } from 'app/components/FormGenerator';
import { FormGroupLayoutMode } from 'app/components/FormGenerator/constants';
import GroupLayout from 'app/components/FormGenerator/Layout/GroupLayout';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import { WidgetContext } from 'app/pages/DashBoardPage/components/WidgetProvider/WidgetProvider';
import { ChartDataConfig, ChartStyleConfig } from 'app/types/ChartConfig';
import {
  countConfigLeaves,
  getDefaultExpandedConfigKeys,
  getVisibleConfigItems,
} from 'app/visualization/config/configPanelUtils';
import { FC, memo, useContext, useMemo } from 'react';
import styled from 'styled-components';
import widgetManagerInstance from '../../../../components/WidgetManager';


const describeWidgetGroup = (key = '', label = '') => {
  const text = `${key} ${label}`.toLowerCase();
  if (/title|header/.test(text)) return '标题与组件头部展示';
  if (/background|border|shadow|style/.test(text)) return '背景、边框、圆角与视觉效果';
  if (/padding|margin|layout|position|size/.test(text)) return '组件布局、留白和尺寸';
  if (/drill|link|interaction|viewdetail/.test(text)) return '钻取、联动与明细查看行为';
  if (/refresh|auto/.test(text)) return '自动刷新与运行行为';
  return '组件展示与行为设置';
};

const StyledWrapper = styled.div`
  width: 100%;
  min-height: 0;
`;

export const WidgetConfigPanel: FC<{
  configs: ChartStyleConfig[];
  dataConfigs?: ChartDataConfig[];
  context?: any;
  onChange: (
    ancestors: number[],
    config: ChartStyleConfig,
    needRefresh?: boolean,
  ) => void;
}> = memo(({ configs, dataConfigs, context, onChange }) => {
  const widget = useContext(WidgetContext);
  const i18ns = widgetManagerInstance.meta(widget.config.originalType).i18ns;
  return (
    <ChartI18NContext.Provider value={{ i18NConfigs: i18ns }}>
      <StyledWrapper onClick={e => e.stopPropagation()}>
        <BoardConfigCollapse
          dataConfigs={dataConfigs}
          configs={configs || []}
          context={context}
          onChange={onChange}
        />
      </StyledWrapper>
    </ChartI18NContext.Provider>
  );
});

export const BoardConfigCollapse: FC<{
  configs: ChartStyleConfig[];
  dataConfigs?: ChartDataConfig[];
  context?: any;
  onChange: (
    ancestors: number[],
    config: ChartStyleConfig,
    needRefresh?: boolean,
  ) => void;
}> = memo(({ configs, dataConfigs, context, onChange }) => {
  const t = useI18NPrefix();
  const visible = useMemo(() => getVisibleConfigItems(configs), [configs]);
  const defaultKeys = useMemo(
    () => getDefaultExpandedConfigKeys(configs),
    [configs],
  );
  const standalone = visible.filter(item => item.comType !== 'group');
  const groups = visible.filter(item => item.comType === 'group');
  return (
    <ConfigShell>
      {standalone.length > 0 && (
        <QuickSettings>
          <SectionTitle>常用设置</SectionTitle>
          {standalone.map(item => (
            <ItemLayout
              key={item.key}
              ancestors={[configs.findIndex(config => config === item)]}
              data={item}
              translate={t}
              dataConfigs={dataConfigs}
              context={context}
              onChange={onChange}
            />
          ))}
        </QuickSettings>
      )}
      <StyledCollapse
        ghost
        expandIconPosition="end"
        defaultActiveKey={defaultKeys}
      >
        {groups.map(item => {
          const index = configs.findIndex(config => config === item);
          return (
            <Collapse.Panel
              key={item.key}
              header={
                <GroupHeader>
                  <GroupText>
                    <span>{t(item.label, true)}</span>
                    <small>{describeWidgetGroup(item.key, t(item.label, true))}</small>
                  </GroupText>
                  <em>{countConfigLeaves(item)} 项</em>
                </GroupHeader>
              }
            >
              <GroupLayout
                ancestors={[index]}
                mode={FormGroupLayoutMode.INNER}
                data={item}
                translate={t}
                dataConfigs={dataConfigs}
                context={context}
                onChange={onChange}
              />
            </Collapse.Panel>
          );
        })}
      </StyledCollapse>
    </ConfigShell>
  );
});

const ConfigShell = styled.div`padding-bottom: 8px;`;
const QuickSettings = styled.section`
  padding: 10px 0 4px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;
const SectionTitle = styled.div`
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;
const StyledCollapse = styled(Collapse)`
  .ant-collapse-item { border-bottom: 1px solid ${p => p.theme.borderColorSplit}; }
  .ant-collapse-header { padding: 10px 0 !important; }
  .ant-collapse-content-box { padding: 0 0 8px !important; }
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

const GroupText = styled.div`
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
