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

import {
  BlockOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tag, Tabs } from 'antd';
import { PaneWrapper } from 'app/components';
import useComputedState from 'app/hooks/useComputedState';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import ChartPaletteContext from 'app/pages/ChartWorkbenchPage/contexts/ChartPaletteContext';
import { ChartConfigReducerActionType } from 'app/pages/ChartWorkbenchPage/slice/constant';
import { currentDataViewSelector } from 'app/pages/ChartWorkbenchPage/slice/selectors';
import { ChartConfigPayloadType } from 'app/pages/ChartWorkbenchPage/slice/types';
import { selectVizs } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import {
  ChartConfig,
  ChartDataConfig,
  ChartStyleConfig,
} from 'app/types/ChartConfig';
import ChartDataView from 'app/types/ChartDataView';
import { chartRegistry } from 'app/visualization/registry/ChartRegistry';
import { reconcileChartConfigFieldMeta } from 'app/utils/internalChartHelper';
import { FC, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
  SPACE_MD,
} from 'styles/StyleConstants';
import { cond, isEmptyArray } from 'utils/object';
import ChartToolbar from '../ChartToolbar';
import ChartDataConfigPanel from './ChartDataConfigPanel';
import ChartStyleConfigPanel from './ChartStyleConfigPanel';

const { TabPane } = Tabs;

const CONFIG_PANEL_TABS = {
  DATA: 'data',
  STYLE: 'style',
  SETTING: 'setting',
  INTERACTION: 'interaction',
};

const ChartConfigPanel: FC<{
  dataView?: ChartDataView;
  chartId?: string;
  chartConfig?: ChartConfig;
  expensiveQuery?: boolean;
  onChange: (type: string, payload: ChartConfigPayloadType) => void;
}> = memo(
  ({ chartId, chartConfig, expensiveQuery, onChange }) => {
    const t = useI18NPrefix(`viz.palette`);
    const vizs = useSelector(selectVizs);
    const dataview = useSelector(currentDataViewSelector);
    const editorChartConfig = useMemo(() => {
      const fields = [
        ...(dataview?.meta || []),
        ...(dataview?.computedFields || []),
      ];
      return chartConfig && fields.length
        ? reconcileChartConfigFieldMeta(chartConfig, fields)
        : chartConfig;
    }, [chartConfig, dataview?.computedFields, dataview?.meta]);
    const editorDataConfigs = editorChartConfig?.datas;
    const visualPlugin = useMemo(() => chartRegistry.get(chartId), [chartId]);
    const fieldSlots = visualPlugin?.configSchema?.fieldSlots || [];
    const capabilityLabels = useMemo(
      () =>
        Object.entries(visualPlugin?.capabilities || {})
          .filter(([, enabled]) => enabled)
          .map(([capability]) => capability),
      [visualPlugin],
    );
    const [tabActiveKey, setTabActiveKey] = useComputedState(
      () => {
        return cond(
          [config => !isEmptyArray(config?.datas), CONFIG_PANEL_TABS.DATA],
          [config => !isEmptyArray(config?.styles), CONFIG_PANEL_TABS.STYLE],
          [
            config => !isEmptyArray(config?.settings),
            CONFIG_PANEL_TABS.SETTING,
          ],
          [
            config => !isEmptyArray(config?.interactions),
            CONFIG_PANEL_TABS.INTERACTION,
          ],
        )(chartConfig, CONFIG_PANEL_TABS.DATA);
      },
      (prev, next) => prev !== next,
      chartId,
    );

    const onDataConfigChanged = (
      ancestors,
      config: ChartDataConfig,
      needRefresh?: boolean,
    ) => {
      onChange?.(ChartConfigReducerActionType.DATA, {
        ancestors: ancestors,
        value: config,
        needRefresh,
      });
    };

    const handleConfigChangeByAction =
      (actionType: string) =>
      (
        ancestors: number[],
        config: ChartStyleConfig,
        needRefresh?: boolean,
      ) => {
        onChange?.(actionType, {
          ancestors: ancestors,
          value: config,
          needRefresh,
        });
      };

    return (
      <ChartI18NContext.Provider value={{ i18NConfigs: chartConfig?.i18ns }}>
        <ChartPaletteContext.Provider value={{ datas: editorDataConfigs }}>
          <StyledChartDataViewPanel>
            <PanelIntro>
              <strong>图表配置</strong>
              <span>配置字段、样式、交互和高级选项</span>
            </PanelIntro>
            {visualPlugin && (
              <VisualMetaCard>
                <VisualMetaHeader>
                  <div>
                    <strong>{visualPlugin.name}</strong>
                    <span>{visualPlugin.renderer.toUpperCase()} Renderer</span>
                  </div>
                  {!visualPlugin.legacyChart && <Tag color="blue">V2</Tag>}
                </VisualMetaHeader>
                {!!fieldSlots.length && (
                  <MetaSection>
                    <MetaSectionTitle>字段要求</MetaSectionTitle>
                    <FieldSlotList>
                      {fieldSlots
                        .filter(slot => slot.type !== 'filter')
                        .map(slot => (
                          <FieldSlotChip key={slot.key}>
                            <span>{slot.label}</span>
                            <small>
                              {slot.required ? '必填' : '可选'} · {slot.min ?? 0}
                              {typeof slot.max === 'number' ? `-${slot.max}` : '+'}
                            </small>
                          </FieldSlotChip>
                        ))}
                    </FieldSlotList>
                  </MetaSection>
                )}
                {!!capabilityLabels.length && (
                  <MetaSection>
                    <MetaSectionTitle>图表能力</MetaSectionTitle>
                    <CapabilityList>
                      {capabilityLabels.map(capability => (
                        <Tag key={capability}>{capability}</Tag>
                      ))}
                    </CapabilityList>
                  </MetaSection>
                )}
              </VisualMetaCard>
            )}
            <ChartToolbar />
            <ConfigBlock>
              <Tabs
                activeKey={tabActiveKey}
                className="tabs"
                onChange={setTabActiveKey}
              >
                {!isEmptyArray(editorDataConfigs) && (
                  <TabPane
                    tab={
                      <span>
                        <DatabaseOutlined />
                        {t('title.content')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.DATA}
                  />
                )}
                {!isEmptyArray(chartConfig?.styles) && (
                  <TabPane
                    tab={
                      <span>
                        <DashboardOutlined />
                        {t('title.design')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.STYLE}
                  />
                )}
                {!isEmptyArray(chartConfig?.settings) && (
                  <TabPane
                    tab={
                      <span>
                        <SettingOutlined />
                        {t('title.setting')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.SETTING}
                  />
                )}
                {!isEmptyArray(chartConfig?.interactions) && (
                  <TabPane
                    tab={
                      <span>
                        <BlockOutlined />
                        {t('title.interaction')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.INTERACTION}
                  />
                )}
              </Tabs>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.DATA}>
                <ChartDataConfigPanel
                  dataConfigs={editorDataConfigs}
                  expensiveQuery={expensiveQuery}
                  onChange={onDataConfigChanged}
                />
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.STYLE}>
                <ChartStyleConfigPanel
                  i18nPrefix="viz.palette.style"
                  configs={chartConfig?.styles}
                  dataConfigs={editorDataConfigs}
                  onChange={handleConfigChangeByAction(
                    ChartConfigReducerActionType.STYLE,
                  )}
                />
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.SETTING}>
                <ChartStyleConfigPanel
                  i18nPrefix="viz.palette.setting"
                  configs={chartConfig?.settings}
                  dataConfigs={editorDataConfigs}
                  onChange={handleConfigChangeByAction(
                    ChartConfigReducerActionType.SETTING,
                  )}
                />
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.INTERACTION}>
                <ChartStyleConfigPanel
                  i18nPrefix="viz.palette.interaction"
                  configs={chartConfig?.interactions}
                  dataConfigs={editorDataConfigs}
                  context={{ vizs, dataview }}
                  onChange={handleConfigChangeByAction(
                    ChartConfigReducerActionType.INTERACTION,
                  )}
                />
              </Pane>
            </ConfigBlock>
          </StyledChartDataViewPanel>
        </ChartPaletteContext.Provider>
      </ChartI18NContext.Provider>
    );
  },
  (prev, next) =>
    prev.chartConfig === next.chartConfig &&
    prev.chartId === next.chartId &&
    prev.expensiveQuery === next.expensiveQuery,
);

export default ChartConfigPanel;

const StyledChartDataViewPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 ${SPACE_MD} ${SPACE_MD};
  background: #f8fafc;
  border-left: 1px solid #eaecf0;
`;

const PanelIntro = styled.div`
  flex-shrink: 0;
  padding: 14px 0 10px;

  strong {
    display: block;
    font-size: 12px;
    font-weight: 650;
    color: #1d2939;
  }

  span {
    display: block;
    margin-top: 3px;
    font-size: 10px;
    line-height: 1.5;
    color: #98a2b3;
  }
`;

const ConfigBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: ${BORDER_RADIUS};

  .tabs {
    flex-shrink: 0;
    padding: 0 ${SPACE_MD};
    font-weight: ${FONT_WEIGHT_MEDIUM};
    color: ${p => p.theme.textColorSnd};

    .ant-tabs-tab + .ant-tabs-tab {
      margin: 0 0 0 ${SPACE_MD};
    }
  }
`;

const Pane = styled(PaneWrapper)`
  padding: 0 ${SPACE_MD};
  overflow-y: auto;
`;


const VisualMetaCard = styled.div`
  flex-shrink: 0;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: ${BORDER_RADIUS};
`;

const VisualMetaHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  strong {
    display: block;
    font-size: 12px;
    color: #1d2939;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 10px;
    color: #98a2b3;
  }
`;

const MetaSection = styled.div`
  margin-top: 9px;
`;

const MetaSectionTitle = styled.div`
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 600;
  color: #667085;
`;

const FieldSlotList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const FieldSlotChip = styled.div`
  min-width: 72px;
  padding: 5px 7px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 6px;

  span,
  small {
    display: block;
  }

  span {
    font-size: 10px;
    font-weight: 600;
    color: #344054;
  }

  small {
    margin-top: 1px;
    font-size: 9px;
    color: #98a2b3;
  }
`;

const CapabilityList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .ant-tag {
    margin: 0;
    font-size: 9px;
    line-height: 18px;
  }
`;
