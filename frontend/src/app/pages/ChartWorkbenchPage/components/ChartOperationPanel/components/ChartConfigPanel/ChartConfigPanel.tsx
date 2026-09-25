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
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Button, Popover, Segmented, Space, Tabs } from 'antd';
import { PaneWrapper } from 'app/components';
import useComputedState from 'app/hooks/useComputedState';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import ChartPaletteContext from 'app/pages/ChartWorkbenchPage/contexts/ChartPaletteContext';
import { ChartConfigReducerActionType } from 'app/pages/ChartWorkbenchPage/slice/constant';
import { currentDataViewSelector } from 'app/pages/ChartWorkbenchPage/slice/selectors';
import { ChartConfigPayloadType } from 'app/pages/ChartWorkbenchPage/slice/types';
import ChartManager from 'app/models/ChartManager';
import { IChart } from 'app/types/Chart';
import { selectVizs } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import {
  ChartConfig,
  ChartDataConfig,
  ChartStyleConfig,
} from 'app/types/ChartConfig';
import ChartDataView from 'app/types/ChartDataView';
import {
  reconcileChartConfigFieldMeta,
  transferChartDataConfig,
} from 'app/utils/internalChartHelper';
import { FC, memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
  SPACE_MD,
} from 'styles/StyleConstants';
import { CloneValueDeep, cond, isEmptyArray } from 'utils/object';
import { countVisibleConfigItems } from 'app/visualization/config/configPanelUtils';
import { getVisualStylePresetPatches, VisualStylePreset } from 'app/visualization/config/stylePresets';
import { recommendVisualTypes } from '../../visualRecommendation';
import ChartGraphPanel from '../ChartGraphPanel';
import ChartToolbar from '../ChartToolbar';
import ChartDataConfigPanel from './ChartDataConfigPanel';
import ChartStyleConfigPanel from './ChartStyleConfigPanel';

const { TabPane } = Tabs;

const CONFIG_PANEL_TABS = {
  DATA: 'data',
  STYLE: 'style',
  ANALYSIS: 'analysis',
};

const ChartConfigPanel: FC<{
  dataView?: ChartDataView;
  chart?: IChart;
  chartId?: string;
  chartConfig?: ChartConfig;
  expensiveQuery?: boolean;
  onChartChange: (chart: IChart) => void;
  onChange: (type: string, payload: ChartConfigPayloadType) => void;
}> = memo(
  ({ chart, chartId, chartConfig, expensiveQuery, onChartChange, onChange }) => {
    const t = useI18NPrefix(`viz.palette`);
    const vizs = useSelector(selectVizs);
    const dataview = useSelector(currentDataViewSelector);
    const [visualPickerOpen, setVisualPickerOpen] = useState(false);
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
    const dataFieldCount = useMemo(
      () => (editorDataConfigs || []).reduce((count, section) => count + (section.rows?.length || 0), 0),
      [editorDataConfigs],
    );
    const styleConfigCount = useMemo(
      () => countVisibleConfigItems(chartConfig?.styles || []),
      [chartConfig?.styles],
    );
    const analysisConfigCount = useMemo(
      () =>
        countVisibleConfigItems(chartConfig?.settings || []) +
        countVisibleConfigItems(chartConfig?.interactions || []),
      [chartConfig?.interactions, chartConfig?.settings],
    );
    const recommendedCharts = useMemo(() => {
      ChartManager.instance();
      return recommendVisualTypes(editorChartConfig)
        .map(type => ChartManager.instance().getById(type))
        .filter((candidate): candidate is IChart => {
          if (!candidate || candidate.meta.id === chart?.meta?.id) return false;
          const transferred = transferChartDataConfig(
            { datas: CloneValueDeep(candidate.config?.datas || []) },
            { datas: editorDataConfigs },
          );
          return candidate.isMatchRequirement(transferred);
        })
        .slice(0, 3);
    }, [chart?.meta?.id, editorChartConfig, editorDataConfigs]);
    const [tabActiveKey, setTabActiveKey] = useComputedState(
      () => {
        return cond(
          [config => !isEmptyArray(config?.datas), CONFIG_PANEL_TABS.DATA],
          [config => !isEmptyArray(config?.styles), CONFIG_PANEL_TABS.STYLE],
          [
            config =>
              !isEmptyArray(config?.settings) ||
              !isEmptyArray(config?.interactions),
            CONFIG_PANEL_TABS.ANALYSIS,
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

    const applyStylePreset = (preset: VisualStylePreset) => {
      getVisualStylePresetPatches(chartConfig?.styles || [], preset).forEach(
        ({ ancestors, config }) => {
          onChange?.(ChartConfigReducerActionType.STYLE, {
            ancestors,
            value: config,
            needRefresh: false,
          });
        },
      );
    };

    return (
      <ChartI18NContext.Provider value={{ i18NConfigs: chartConfig?.i18ns }}>
        <ChartPaletteContext.Provider value={{ datas: editorDataConfigs }}>
          <StyledChartDataViewPanel>
            <PanelHeader>
              <span>可视化配置</span>
              <Popover
                trigger="click"
                placement="bottomRight"
                open={visualPickerOpen}
                onOpenChange={setVisualPickerOpen}
                content={
                  <ChartGraphPanel
                    chart={chart}
                    chartConfig={chartConfig}
                    onChartChange={nextChart => {
                      onChartChange(nextChart);
                      setVisualPickerOpen(false);
                    }}
                  />
                }
              >
                <Button size="small" icon={<AppstoreOutlined />}>
                  切换图表
                </Button>
              </Popover>
            </PanelHeader>
            <CurrentVisual>
              <Space size={8}>
                <AppstoreOutlined />
                <span>当前图表</span>
              </Space>
              <strong>{chart?.meta?.name ? t(chart.meta.name, true) : '未选择'}</strong>
            </CurrentVisual>
            {recommendedCharts.length > 0 ? (
              <RecommendationBar>
                <RecommendationLabel>推荐图表</RecommendationLabel>
                <RecommendationList>
                  {recommendedCharts.map(candidate => (
                    <Button
                      key={candidate.meta.id}
                      size="small"
                      type="text"
                      onClick={() => onChartChange(candidate)}
                    >
                      {t(candidate.meta.name, true)}
                    </Button>
                  ))}
                </RecommendationList>
              </RecommendationBar>
            ) : (
              <RecommendationHint>双击左侧字段可快速添加到当前图表</RecommendationHint>
            )}
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
                        <TabCount>{dataFieldCount}</TabCount>
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
                        <TabCount>{styleConfigCount}</TabCount>
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.STYLE}
                  />
                )}
                {(!isEmptyArray(chartConfig?.settings) ||
                  !isEmptyArray(chartConfig?.interactions)) && (
                  <TabPane
                    tab={
                      <span>
                        <LineChartOutlined />
                        分析
                        <TabCount>{analysisConfigCount}</TabCount>
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.ANALYSIS}
                  />
                )}
              </Tabs>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.DATA}>
                <ChartToolbar />
                <ChartDataConfigPanel
                  dataConfigs={editorDataConfigs}
                  expensiveQuery={expensiveQuery}
                  onChange={onDataConfigChanged}
                />
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.STYLE}>
                <StylePresetBar>
                  <div>
                    <strong>样式预设</strong>
                    <span>快速统一常用展示项，仍可继续逐项调整</span>
                  </div>
                  <Segmented
                    size="small"
                    options={[
                      { label: '简洁', value: 'minimal' },
                      { label: '商务', value: 'business' },
                      { label: '强调', value: 'emphasis' },
                    ]}
                    onChange={value => applyStylePreset(value as VisualStylePreset)}
                  />
                </StylePresetBar>
                <ChartStyleConfigPanel
                  i18nPrefix="viz.palette.style"
                  configs={chartConfig?.styles}
                  dataConfigs={editorDataConfigs}
                  onChange={handleConfigChangeByAction(
                    ChartConfigReducerActionType.STYLE,
                  )}
                />
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.ANALYSIS}>
                {!isEmptyArray(chartConfig?.settings) && (
                  <AnalysisSection>
                    <AnalysisSectionTitle>图表设置</AnalysisSectionTitle>
                    <ChartStyleConfigPanel
                      i18nPrefix="viz.palette.setting"
                      configs={chartConfig?.settings}
                      dataConfigs={editorDataConfigs}
                      onChange={handleConfigChangeByAction(
                        ChartConfigReducerActionType.SETTING,
                      )}
                    />
                  </AnalysisSection>
                )}
                {!isEmptyArray(chartConfig?.interactions) && (
                  <AnalysisSection>
                    <AnalysisSectionTitle>交互分析</AnalysisSectionTitle>
                    <ChartStyleConfigPanel
                      i18nPrefix="viz.palette.interaction"
                      configs={chartConfig?.interactions}
                      dataConfigs={editorDataConfigs}
                      context={{ vizs, dataview }}
                      onChange={handleConfigChangeByAction(
                        ChartConfigReducerActionType.INTERACTION,
                      )}
                    />
                  </AnalysisSection>
                )}
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
    prev.expensiveQuery === next.expensiveQuery &&
    prev.onChartChange === next.onChartChange,
);

export default ChartConfigPanel;

const StyledChartDataViewPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  background: ${p => p.theme.componentBackground};
  border-left: 1px solid ${p => p.theme.borderColorSplit};
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  background: ${p => p.theme.componentBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const CurrentVisual = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  font-size: 12px;
  color: ${p => p.theme.textColorSnd};
  background: ${p => p.theme.bodyBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  strong {
    max-width: 150px;
    overflow: hidden;
    color: ${p => p.theme.textColor};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ConfigBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background: ${p => p.theme.componentBackground};

  .tabs {
    flex-shrink: 0;
    padding: 0 12px;
    font-size: 12px;
    font-weight: ${FONT_WEIGHT_MEDIUM};
    color: ${p => p.theme.textColorSnd};

    .ant-tabs-tab + .ant-tabs-tab {
      margin: 0 0 0 18px;
    }
  }
`;

const Pane = styled(PaneWrapper)`
  padding: 0 12px 12px;
  overflow-y: auto;
`;

const AnalysisSection = styled.section`
  & + & {
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid ${p => p.theme.borderColorSplit};
  }
`;

const AnalysisSectionTitle = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;

const RecommendationBar = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 4px 10px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const RecommendationLabel = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  color: ${p => p.theme.textColorSnd};
`;

const RecommendationList = styled.div`
  display: flex;
  gap: 2px;
  min-width: 0;
  overflow: hidden;

  .ant-btn {
    padding: 0 6px;
    color: ${p => p.theme.info};
  }
`;

const RecommendationHint = styled.div`
  flex-shrink: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: ${p => p.theme.textColorDisabled};
  background: ${p => p.theme.bodyBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const StylePresetBar = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px 0 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: 12px;
    color: ${p => p.theme.textColor};
  }

  span {
    font-size: 10px;
    color: ${p => p.theme.textColorDisabled};
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  font-size: 10px;
  font-weight: 400;
  color: ${p => p.theme.textColorDisabled};
  background: ${p => p.theme.bodyBackground};
  border-radius: 9px;
`;
