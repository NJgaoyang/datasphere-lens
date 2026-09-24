import { init } from 'echarts';
import { FC, useEffect, useRef } from 'react';
import { VisualRendererProps } from '../../registry/RendererRegistry';

const EChartsRenderer: FC<VisualRendererProps> = ({
  spec,
  plugin,
  dataset,
  config,
  style,
  isShown = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof init>>();

  useEffect(() => {
    if (!containerRef.current || !isShown) return;
    chartRef.current = init(containerRef.current, 'default');
    return () => {
      chartRef.current?.dispose();
      chartRef.current = undefined;
    };
  }, [isShown]);

  useEffect(() => {
    if (!chartRef.current || !plugin.buildOption) return;
    chartRef.current.setOption(plugin.buildOption(spec, dataset, config) as any, true);
  }, [config, dataset, plugin, spec]);

  useEffect(() => {
    chartRef.current?.resize();
  }, [style?.height, style?.width]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} />;
};

export default EChartsRenderer;
