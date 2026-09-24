import { FC } from 'react';
import { VisualRendererProps } from '../../registry/RendererRegistry';
import LegacyChartRenderer from '../../renderer/LegacyChartRenderer';

/**
 * Dedicated renderer boundary for AntV S2 based visuals.
 * The first implementation reuses the proven Datart lifecycle adapter so
 * pivot-table selection, drill and resize behavior stay fully compatible.
 */
const S2Renderer: FC<VisualRendererProps> = props => (
  <LegacyChartRenderer {...props} />
);

export default S2Renderer;
