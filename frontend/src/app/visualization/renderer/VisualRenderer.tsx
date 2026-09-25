import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Empty, Result } from 'antd';
import { FC } from 'react';
import { validateVisualSpec } from '../config/validateVisualSpec';
import VisualErrorBoundary from './VisualErrorBoundary';
import { chartRegistry } from '../registry/ChartRegistry';
import {
  rendererRegistry,
  VisualRendererProps,
} from '../registry/RendererRegistry';

export type VisualRendererInput = Omit<VisualRendererProps, 'plugin'>;

const VisualRenderer: FC<VisualRendererInput> = props => {
  const plugin = chartRegistry.get(props.spec.type);
  if (!plugin) {
    return <Result status="warning" title="未找到图表插件" subTitle={props.spec.type} />;
  }

  const Renderer = rendererRegistry.get(plugin.renderer);
  if (!Renderer) {
    return (
      <Result
        status="warning"
        title="未找到图表渲染器"
        subTitle={`${plugin.name} 需要 ${plugin.renderer} Renderer`}
      />
    );
  }

  const isNativeV2 = !plugin.legacyChart || plugin.type.endsWith('-v2');
  const validation = isNativeV2
    ? validateVisualSpec(props.spec, plugin.configSchema)
    : [];
  const invalid = validation.filter(item => !item.valid);

  if (invalid.length) {
    return (
      <Empty
        image={<ExclamationCircleOutlined style={{ fontSize: 38, color: '#faad14' }} />}
        description={
          <div>
            <strong>字段配置不完整</strong>
            {invalid.map(item => (
              <div key={`${item.slot.type}-${item.slot.label}`}>{item.message}</div>
            ))}
          </div>
        }
      />
    );
  }

  return (
    <VisualErrorBoundary visualType={plugin.type}>
      <Renderer {...props} plugin={plugin} />
    </VisualErrorBoundary>
  );
};

export default VisualRenderer;
