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

import { Space, Tabs, Tag } from 'antd';
import useChartInteractions from 'app/hooks/useChartInteractions';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { WidgetChartContext } from 'app/pages/DashBoardPage/components/WidgetProvider/WidgetChartProvider';
import { WidgetContext } from 'app/pages/DashBoardPage/components/WidgetProvider/WidgetProvider';
import { selectVizs } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import { ChartStyleConfig } from 'app/types/ChartConfig';
import { updateBy } from 'app/utils/mutation';
import { FC, memo, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { editBoardStackActions } from '../../slice';
import { showRectAction } from '../../slice/actions/actions';
import { selectSortAllWidgets } from '../../slice/selectors';
import widgetManagerInstance from '../../../../components/WidgetManager';
import { NameSet } from './SettingItem/NameSet';
import { RectSet } from './SettingItem/RectSet';
import { SettingPanel } from './SettingPanel';
import { WidgetConfigPanel } from './WidgetConfigPanel';

const { TabPane } = Tabs;

const countVisibleConfigItems = (configs: ChartStyleConfig[] = []): number =>
  configs
    .filter(config => !config.hidden)
    .reduce(
      (count, config) =>
        count +
        (config.comType === 'group'
          ? countVisibleConfigItems((config as any).rows || [])
          : 1),
      0,
    );

export const WidgetSetting: FC<{ boardId?: string }> = memo(({ boardId }) => {
  const t = useI18NPrefix(`viz.board.setting`);
  const dispatch = useDispatch();
  const widget = useContext(WidgetContext);
  const widgetTypeName = widgetManagerInstance
    .toolkit(widget.config.originalType)
    .getName();
  const { dataChart, chartDataView } = useContext(WidgetChartContext);
  const showRect = dispatch(showRectAction(widget)) as unknown as boolean;
  const [currentTab, setCurrentTab] = useState<string>('style');
  const vizs = useSelector(selectVizs);
  const allWidgets = useSelector(selectSortAllWidgets);
  const { getDrillThroughSetting, getViewDetailSetting } = useChartInteractions(
    {},
  );
  const activeRect = widget.config.boardType === 'free'
    ? widget.config.rect
    : widget.config.pRect || widget.config.rect;
  const styleCount = useMemo(
    () => countVisibleConfigItems(widget.config.customConfig.props || []),
    [widget.config.customConfig.props],
  );
  const interactionCount = useMemo(
    () => countVisibleConfigItems(widget.config.customConfig.interactions || []),
    [widget.config.customConfig.interactions],
  );

  const handleStyleConfigChange = (
    ancestors: number[],
    configItem: ChartStyleConfig,
    needRefresh?: boolean,
  ) => {
    dispatch(
      editBoardStackActions.updateWidgetStyleConfigByPath({
        ancestors,
        configItem,
        wid: widget.id,
      }),
    );
  };

  const handleInteractionConfigChange = (
    ancestors: number[],
    configItem: ChartStyleConfig,
    needRefresh?: boolean,
  ) => {
    dispatch(
      editBoardStackActions.updateWidgetInteractionConfigByPath({
        ancestors,
        configItem,
        wid: widget.id,
      }),
    );
  };

  const updateInteractionOptionWhenHasChartInteraction = (
    interactions: ChartStyleConfig[],
  ) => {
    const drillThroughKey = 'drillThrough';
    const viewDetailKey = 'viewDetail';
    const chartInteractions =
      dataChart?.config?.chartConfig?.interactions || [];
    const chartDrillThroughSetting = getDrillThroughSetting(
      chartInteractions,
      [],
    );
    const chartViewDetailSetting = getViewDetailSetting(chartInteractions, []);
    return updateBy(interactions, draft => {
      let boardDrillThrough = draft.find(i => i.key === drillThroughKey);
      let boardViewDetail = draft.find(i => i.key === viewDetailKey);
      if (boardDrillThrough) {
        boardDrillThrough.options = Object.assign(
          {},
          boardDrillThrough?.options,
          {
            hasOriginal: !!chartDrillThroughSetting,
          },
        );
      }
      if (boardViewDetail) {
        boardViewDetail.options = Object.assign(
          {},
          boardDrillThrough?.options,
          {
            hasOriginal: !!chartViewDetailSetting,
          },
        );
      }
      return interactions;
    });
  };

  return (
    <Inspector onClick={event => event.stopPropagation()}>
      <InspectorHeader>
        <WidgetMeta>
          <WidgetType>{widgetTypeName}</WidgetType>
          <WidgetName title={widget.config.name || undefined}>
            {widget.config.name || t('widget')}
          </WidgetName>
        </WidgetMeta>
        <WidgetSummary>
          {dataChart?.name && <Tag bordered={false}>{`图表 · ${dataChart.name}`}</Tag>}
          {chartDataView?.name && (
            <Tag bordered={false}>{`数据集 · ${chartDataView.name}`}</Tag>
          )}
          {activeRect && (
            <Tag bordered={false}>{`尺寸 · ${activeRect.width} × ${activeRect.height}`}</Tag>
          )}
        </WidgetSummary>
      </InspectorHeader>
      <StyledWidgetSetting
        activeKey={currentTab}
        onChange={key => setCurrentTab(key)}
      >
        <TabPane
          tab={<Space size={4}><span>外观</span><TabCount>{styleCount}</TabCount></Space>}
          key="style"
        >
          <SettingPanel
            title="组件外观"
            description="配置组件名称、位置尺寸和视觉样式"
          >
            <>
              <SubSection>
                <SubSectionTitle>基础信息</SubSectionTitle>
                <NameSet
                wid={widget.id}
                name={widget.config.name}
                boardVizs={allWidgets}
              />
              </SubSection>
              {showRect && (
                <SubSection>
                  <SubSectionTitle>布局尺寸</SubSectionTitle>
                  <RectSet wid={widget.id} rect={widget.config.rect} />
                </SubSection>
              )}
              <SubSection>
                <SubSectionTitle>视觉样式</SubSectionTitle>
                <WidgetConfigPanel
                configs={widget.config.customConfig.props || []}
                onChange={handleStyleConfigChange}
              />
              </SubSection>
            </>
          </SettingPanel>
        </TabPane>
        <TabPane
          tab={<Space size={4}><span>交互</span><TabCount>{interactionCount}</TabCount></Space>}
          key="interaction"
        >
          <SettingPanel
            title="交互行为"
            description="设置组件与其他图表之间的钻取、联动和查看明细行为"
          >
            <WidgetConfigPanel
              configs={updateInteractionOptionWhenHasChartInteraction(
                widget.config.customConfig.interactions || [],
              )}
              dataConfigs={dataChart?.config?.chartConfig?.datas}
              context={{
                widgetId: widget?.id,
                vizs,
                boardVizs: allWidgets,
                dataview: chartDataView,
              }}
              onChange={handleInteractionConfigChange}
            />
          </SettingPanel>
        </TabPane>
      </StyledWidgetSetting>
    </Inspector>
  );
});

export default WidgetSetting;

const Inspector = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background: ${p => p.theme.componentBackground};
  border-left: 1px solid ${p => p.theme.borderColorSplit};
`;

const InspectorHeader = styled.div`
  flex: 0 0 auto;
  padding: 10px 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;


const WidgetMeta = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  margin-top: 0;
`;

const WidgetType = styled.span`
  flex: 0 0 auto;
  padding: 2px 7px;
  font-size: 11px;
  line-height: 18px;
  color: ${p => p.theme.primary};
  background: ${p => p.theme.emphasisBackground};
  border-radius: 4px;
`;

const WidgetName = styled.span`
  min-width: 0;
  margin-left: 8px;
  overflow: hidden;
  font-size: 12px;
  color: ${p => p.theme.textColorSnd};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledWidgetSetting = styled(Tabs)`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  > .ant-tabs-nav {
    flex: 0 0 auto;
    padding: 0 18px;
    margin: 0;
    background: ${p => p.theme.componentBackground};
  }

  > .ant-tabs-nav::before {
    border-color: ${p => p.theme.borderColorSplit};
  }

  > .ant-tabs-nav .ant-tabs-tab {
    padding: 12px 2px;
    font-size: 13px;
  }

  > .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
  }

`;

const SubSection = styled.section`
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${p => p.theme.borderColorSplit};
  }
`;

const SubSectionTitle = styled.div`
  padding: 0 8px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.theme.textColorSnd};
`;

const WidgetSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;

  .ant-tag {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    font-size: 10px;
    color: ${p => p.theme.textColorSnd};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  color: ${p => p.theme.textColorDisabled};
  background: ${p => p.theme.bodyBackground};
  border-radius: 9px;
`;
