import { ComponentType, CSSProperties } from 'react';
import { IChart } from 'app/types/Chart';
import { ChartConfig, SelectedItem } from 'app/types/ChartConfig';
import { IChartDrillOption } from 'app/types/ChartDrillOption';
import ChartDataSetDTO from 'app/types/ChartDataSet';
import { ChartSpec } from '../core/ChartSpec';
import { VisualPluginDefinition } from './ChartRegistry';

export interface VisualRendererProps {
  spec: ChartSpec;
  plugin: VisualPluginDefinition;
  dataset?: ChartDataSetDTO;
  config?: ChartConfig;
  chart?: IChart;
  style?: CSSProperties;
  isShown?: boolean;
  drillOption?: IChartDrillOption;
  selectedItems?: SelectedItem[];
  widgetSpecialConfig?: any;
  isLoadingData?: boolean;
}

export type VisualRendererComponent = ComponentType<VisualRendererProps>;

class RendererRegistry {
  private readonly renderers = new Map<string, VisualRendererComponent>();

  register(name: string, renderer: VisualRendererComponent, replace = false) {
    if (this.renderers.has(name) && !replace) {
      throw new Error(`Renderer "${name}" is already registered.`);
    }
    this.renderers.set(name, renderer);
  }
  get(name?: string) {
    return name ? this.renderers.get(name) : undefined;
  }

  has(name: string) {
    return this.renderers.has(name);
  }

  getAll() {
    return Array.from(this.renderers.entries()).map(([name, renderer]) => ({
      name,
      renderer,
    }));
  }

  clear() {
    this.renderers.clear();
  }
}

export const rendererRegistry = new RendererRegistry();
export default RendererRegistry;
