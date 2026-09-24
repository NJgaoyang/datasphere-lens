import { FC } from 'react';
import { VisualRendererProps } from '../../registry/RendererRegistry';
import LegacyChartRenderer from '../../renderer/LegacyChartRenderer';

/**
 * Map renderer boundary. Existing Datart lifecycle is retained initially so
 * map registration, geo resources and interaction behavior remain compatible.
 */
const MapRenderer: FC<VisualRendererProps> = props => (
  <LegacyChartRenderer {...props} />
);

export default MapRenderer;
