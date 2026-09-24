import { FC } from 'react';
import { VisualRendererProps } from '../../registry/RendererRegistry';
import LegacyChartRenderer from '../../renderer/LegacyChartRenderer';

/** Dedicated renderer boundary for ReactChart based visuals. */
const ReactVisualRenderer: FC<VisualRendererProps> = props => (
  <LegacyChartRenderer {...props} />
);

export default ReactVisualRenderer;
