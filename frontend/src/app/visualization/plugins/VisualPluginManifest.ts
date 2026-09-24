import {
  VisualCapabilities,
  VisualCategory,
  VisualPluginDefinition,
} from '../registry/ChartRegistry';

export const VISUAL_PLUGIN_MANIFEST_VERSION = 1;

export interface VisualPluginManifest {
  manifestVersion: number;
  type: string;
  name: string;
  icon?: string;
  category: VisualCategory;
  renderer: string;
  capabilities?: VisualCapabilities;
}

export const toVisualPluginManifest = (
  plugin: VisualPluginDefinition,
): VisualPluginManifest => ({
  manifestVersion: VISUAL_PLUGIN_MANIFEST_VERSION,
  type: plugin.type,
  name: plugin.name,
  icon: plugin.icon,
  category: plugin.category,
  renderer: plugin.renderer,
  capabilities: plugin.capabilities,
});

export const isValidVisualPluginManifest = (manifest: Partial<VisualPluginManifest>) =>
  manifest.manifestVersion === VISUAL_PLUGIN_MANIFEST_VERSION &&
  Boolean(manifest.type && manifest.name && manifest.category && manifest.renderer);
