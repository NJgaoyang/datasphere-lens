import { CHART_SPEC_VERSION, ChartSpec } from '../core/ChartSpec';

export const migrateChartSpec = (input?: Partial<ChartSpec> | null): ChartSpec | undefined => {
  if (!input?.type) return undefined;

  const version = Number(input.version || 1);
  let current: ChartSpec = {
    version,
    type: input.type,
    datasetId: input.datasetId,
    dimensions: input.dimensions || [],
    measures: input.measures || [],
    filters: input.filters || [],
    sorts: input.sorts || [],
    encoding: input.encoding || {},
    options: input.options || {},
    interactions: input.interactions || {},
  };

  // v1 is the first stable persisted contract. Future migrations are applied here.
  if (current.version < CHART_SPEC_VERSION) {
    current = { ...current, version: CHART_SPEC_VERSION };
  }

  return current;
};

export default migrateChartSpec;
