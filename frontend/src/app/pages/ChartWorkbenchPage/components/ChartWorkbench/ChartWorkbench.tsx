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

import ChartAggregationContext from 'app/pages/ChartWorkbenchPage/contexts/ChartAggregationContext';
import ChartDatasetContext from 'app/pages/ChartWorkbenchPage/contexts/ChartDatasetContext';
import ChartDataViewContext from 'app/pages/ChartWorkbenchPage/contexts/ChartDataViewContext';
import TimeConfigContext from 'app/pages/ChartWorkbenchPage/contexts/TimeConfigContext';
import { IChart } from 'app/types/Chart';
import { ChartConfig, SelectedItem } from 'app/types/ChartConfig';
import ChartDataSetDTO from 'app/types/ChartDataSet';
import ChartDataView from 'app/types/ChartDataView';
import { IChartDrillOption } from 'app/types/ChartDrillOption';
import { theme } from 'antd';
import { FC, memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { cancelQuery } from 'utils/queryCancellation';
import ChartDrillContext from '../../../../contexts/ChartDrillContext';
import { dateFormatSelector, languageSelector } from '../../slice/selectors';
import ChartHeaderPanel from '../ChartHeaderPanel';
import ChartOperationPanel from '../ChartOperationPanel';

const ChartWorkbench: FC<{
  dataset?: ChartDataSetDTO;
  dataview?: ChartDataView;
  chartConfig?: ChartConfig;
  chart?: IChart;
  aggregation?: boolean;
  drillOption?: IChartDrillOption;
  selectedItems?: SelectedItem[];
  defaultViewId?: string;
  expensiveQuery: boolean;
  allowQuery: boolean;
  availableSourceFunctions?: string[];
  header?: {
    name?: string;
    orgId?: string;
    container?: string;
    onSaveChart?: () => void;
    onSaveChartToDashBoard?: (dashboardId, dashboardType) => void;
    onGoBack?: () => void;
    onChangeAggregation?: () => void;
  };
  onChartChange: (c: IChart) => void;
  onChartConfigChange: (type, payload) => void;
  onDataViewChange?: (clear?: boolean) => void;
  onRefreshDataset?: () => void;
  onCreateDownloadDataTask?: () => void;
  onChartDrillOptionChange?: (option: IChartDrillOption) => void;
  onDateLevelChange?: (type: string, option: any) => void;
}> = memo(
  ({
    dataset,
    dataview,
    chartConfig,
    chart,
    aggregation,
    drillOption,
    selectedItems,
    header,
    defaultViewId,
    expensiveQuery,
    allowQuery,
    availableSourceFunctions,
    onChartChange,
    onChartConfigChange,
    onDataViewChange,
    onRefreshDataset,
    onCreateDownloadDataTask,
    onChartDrillOptionChange,
    onDateLevelChange,
  }) => {
    const language = useSelector(languageSelector);
    const dateFormat = useSelector(dateFormatSelector);
    const { token } = theme.useToken();

    useEffect(() => () => cancelQuery('chart-workbench'), []);

    return (
      <ChartAggregationContext.Provider
        value={{
          aggregation,
          onChangeAggregation: header?.onChangeAggregation,
        }}
      >
        <ChartDrillContext.Provider
          value={{
            drillOption: drillOption,
            onDrillOptionChange: onChartDrillOptionChange,
            availableSourceFunctions,
            onDateLevelChange,
          }}
        >
          <ChartDatasetContext.Provider
            value={{
              dataset: dataset,
              onRefreshDataset: onRefreshDataset,
            }}
          >
            <ChartDataViewContext.Provider
              value={{
                dataView: dataview,
                availableSourceFunctions,
                expensiveQuery: expensiveQuery,
              }}
            >
              <TimeConfigContext.Provider
                value={{ locale: language, format: dateFormat }}
              >
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    flexFlow: 'column',
                    overflow: 'hidden',
                    background: token.colorBgLayout,
                  }}
                >
                  {header && (
                    <ChartHeaderPanel
                      chartName={header?.name}
                      orgId={header?.orgId}
                      container={header?.container}
                      onGoBack={header?.onGoBack}
                      onSaveChart={header?.onSaveChart}
                      onSaveChartToDashBoard={header?.onSaveChartToDashBoard}
                    />
                  )}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <ChartOperationPanel
                      chart={chart}
                      defaultViewId={defaultViewId}
                      chartConfig={chartConfig}
                      allowQuery={allowQuery}
                      onChartChange={onChartChange}
                      onChartConfigChange={onChartConfigChange}
                      onDataViewChange={onDataViewChange}
                      onCreateDownloadDataTask={onCreateDownloadDataTask}
                      selectedItems={selectedItems}
                    />
                  </div>
                </div>
              </TimeConfigContext.Provider>
            </ChartDataViewContext.Provider>
          </ChartDatasetContext.Provider>
        </ChartDrillContext.Provider>
      </ChartAggregationContext.Provider>
    );
  },
  (prev, next) =>
    prev.header === next.header &&
    prev.dataview === next.dataview &&
    prev.chart === next.chart &&
    prev.chartConfig === next.chartConfig &&
    prev.dataset === next.dataset &&
    prev.defaultViewId === next.defaultViewId &&
    prev.drillOption === next.drillOption &&
    prev.onChartConfigChange === next.onChartConfigChange &&
    prev.availableSourceFunctions === next.availableSourceFunctions &&
    prev.expensiveQuery === next.expensiveQuery,
);

export default ChartWorkbench;

