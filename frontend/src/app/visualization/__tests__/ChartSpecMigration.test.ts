import legacyConfigToChartSpec from '../adapters/legacyConfigToChartSpec';
import migrateChartSpec from '../migration/migrateChartSpec';

describe('ChartSpec migration and legacy adapter', () => {
  test('creates ChartSpec from legacy chart config', () => {
    const spec = legacyConfigToChartSpec(
      'cluster-column-chart',
      {
        datas: [
          {
            key: 'dimension',
            type: 'group',
            rows: [{ colName: 'region', type: 'STRING', category: 'field' } as any],
          },
          {
            key: 'metrics',
            type: 'aggregate',
            rows: [
              {
                colName: 'sales',
                fieldId: 'sales-id',
                type: 'NUMERIC',
                category: 'field',
                aggregate: 'SUM',
              } as any,
            ],
          },
        ],
        styles: [{ key: 'label', value: { showLabel: true } }],
      },
      'view-1',
    );

    expect(spec).toMatchObject({
      version: 1,
      type: 'cluster-column-chart',
      datasetId: 'view-1',
      dimensions: [{ fieldId: 'region' }],
      measures: [{ fieldId: 'sales-id', aggregate: 'SUM' }],
    });
  });

  test('normalizes partial v1 specs', () => {
    expect(
      migrateChartSpec({ type: 'line-chart', dimensions: [], measures: [] }),
    ).toMatchObject({ version: 1, type: 'line-chart', filters: [], sorts: [] });
  });
});
