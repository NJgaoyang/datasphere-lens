import ChartIFrameLifecycleAdapter from 'app/components/ChartIFrameContainer/ChartIFrameLifecycleAdapter';
import { FC } from 'react';
import { VisualRendererProps } from '../registry/RendererRegistry';

const LegacyChartRenderer: FC<VisualRendererProps> = ({
  plugin,
  chart,
  dataset,
  config,
  style = {},
  isShown = true,
  drillOption,
  selectedItems,
  widgetSpecialConfig,
  isLoadingData,
}) => {
  const legacyChart = chart || plugin.legacyChart;

  if (!legacyChart || !config) {
    return null;
  }

  return (
    <ChartIFrameLifecycleAdapter
      chart={legacyChart}
      dataset={dataset}
      config={config}
      style={style}
      isShown={isShown}
      drillOption={drillOption}
      selectedItems={selectedItems}
      widgetSpecialConfig={widgetSpecialConfig}
      isLoadingData={isLoadingData}
    />
  );
};

export default LegacyChartRenderer;
