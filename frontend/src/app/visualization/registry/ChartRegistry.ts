import { IChart } from 'app/types/Chart';
import ChartDataSetDTO from 'app/types/ChartDataSet';
import { VisualConfigSchema } from '../config/ConfigSchema';
import { ChartSpec } from '../core/ChartSpec';

export type VisualCategory =
  | 'table'
  | 'comparison'
  | 'trend'
  | 'distribution'
  | 'relationship'
  | 'map'
  | 'indicator'
  | 'custom';

export interface VisualCapabilities {
  drill?: boolean;
  linkage?: boolean;
  zoom?: boolean;
  brush?: boolean;
  export?: boolean;
}

export type VisualOptionBuilder = (
  spec: ChartSpec,
  dataset?: ChartDataSetDTO,
) => unknown;

export interface VisualPluginDefinition {
  type: string;
  name: string;
  icon?: string;
  category: VisualCategory;
  renderer: string;
  configSchema?: VisualConfigSchema;
  capabilities?: VisualCapabilities;
  buildOption?: VisualOptionBuilder;
  legacyChart?: IChart;
}
class ChartRegistry {
  private readonly plugins = new Map<string, VisualPluginDefinition>();

  register(plugin: VisualPluginDefinition, options?: { replace?: boolean }) {
    if (this.plugins.has(plugin.type) && !options?.replace) {
      throw new Error(`Visual plugin "${plugin.type}" is already registered.`);
    }
    this.plugins.set(plugin.type, plugin);
    return plugin;
  }

  registerMany(plugins: VisualPluginDefinition[], options?: { replace?: boolean }) {
    plugins.forEach(plugin => this.register(plugin, options));
  }

  get(type?: string) {
    return type ? this.plugins.get(type) : undefined;
  }

  getAll() {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: VisualCategory) {
    return this.getAll().filter(plugin => plugin.category === category);
  }

  query(options: {
    category?: VisualCategory;
    capabilities?: Array<keyof VisualCapabilities>;
    legacyCompatible?: boolean;
  } = {}) {
    return this.getAll().filter(plugin => {
      if (options.category && plugin.category !== options.category) return false;
      if (options.legacyCompatible && !plugin.legacyChart) return false;
      return (options.capabilities || []).every(
        capability => plugin.capabilities?.[capability] === true,
      );
    });
  }

  has(type: string) {
    return this.plugins.has(type);
  }

  clear() {
    this.plugins.clear();
  }
}

export const chartRegistry = new ChartRegistry();
export default ChartRegistry;
