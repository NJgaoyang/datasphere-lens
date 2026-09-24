import { IChart } from 'app/types/Chart';
import { VisualConfigSchema } from '../config/ConfigSchema';

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

export interface VisualPluginDefinition {
  type: string;
  name: string;
  icon?: string;
  category: VisualCategory;
  renderer: string;
  configSchema?: VisualConfigSchema;
  capabilities?: VisualCapabilities;
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

  has(type: string) {
    return this.plugins.has(type);
  }

  clear() {
    this.plugins.clear();
  }
}

export const chartRegistry = new ChartRegistry();
export default ChartRegistry;
