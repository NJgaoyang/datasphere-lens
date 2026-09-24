import Chart from 'app/models/Chart';
import { ChartConfig, ChartDataConfig } from 'app/types/ChartConfig';
import { BrokerContext, BrokerOption } from 'app/types/ChartLifecycleBroker';
import { createRoot, Root } from 'react-dom/client';
import { VisualConfigSchema } from '../config/ConfigSchema';
import legacyConfigToChartSpec from './legacyConfigToChartSpec';
import { VisualPluginDefinition } from '../registry/ChartRegistry';
import VisualRenderer from '../renderer/VisualRenderer';

const slotTypeToLegacyType = (type: string) => {
  if (type === 'dimension') return 'group';
  if (type === 'measure') return 'aggregate';
  if (type === 'filter') return 'filter';
  if (type === 'color') return 'color';
  return 'group';
};

const schemaToLegacyConfig = (schema?: VisualConfigSchema): ChartConfig => ({
  datas: (schema?.fieldSlots || []).map(
    slot =>
      ({
        key: slot.key,
        label: slot.label,
        type: slotTypeToLegacyType(slot.type),
        required: slot.required,
        limit: [slot.min ?? 0, slot.max ?? 999],
        allowSameField: slot.allowSameField,
        drillable: slot.drillable,
        rows: [],
      }) as ChartDataConfig,
  ),
  styles: schema?.styles || [],
  settings: schema?.settings || [],
  interactions: schema?.interactions || [],
});

export class VisualPluginChartAdapter extends Chart {
  private root?: Root;

  constructor(private readonly plugin: VisualPluginDefinition) {
    super(plugin.type, plugin.name, plugin.icon);
    this.config = plugin.configSchema?.legacy || schemaToLegacyConfig(plugin.configSchema);
    this.useIFrame = true;
  }

  onMount(options: BrokerOption, context: BrokerContext) {
    const container = context.document?.getElementById(options.containerId);
    if (!container) return;
    this.root = createRoot(container);
    this.renderVisual(options, context);
  }

  onUpdated(options: BrokerOption, context: BrokerContext) {
    this.renderVisual(options, context);
  }

  onResize(options: BrokerOption, context: BrokerContext) {
    this.renderVisual(options, context);
  }

  onUnMount() {
    this.root?.unmount();
    this.root = undefined;
  }

  private renderVisual(options: BrokerOption, context: BrokerContext) {
    if (!this.root) return;
    const config = options.config || this.config || {};
    const spec = legacyConfigToChartSpec(
      this.plugin.type,
      config as any,
      options.dataset?.id,
    );

    this.root.render(
      <VisualRenderer
        spec={spec}
        dataset={options.dataset}
        config={config}
        style={{ width: context.width || '100%', height: context.height || '100%' }}
        drillOption={options.drillOption}
        selectedItems={options.selectedItems}
        widgetSpecialConfig={options.widgetSpecialConfig}
      />,
    );
  }
}

export const visualPluginToChart = (plugin: VisualPluginDefinition) =>
  plugin.legacyChart || new VisualPluginChartAdapter(plugin);

export default VisualPluginChartAdapter;
