import { ChartDataSectionType } from 'app/constants';
import { ChartConfigDTO, ChartStyleConfigDTO } from 'app/types/ChartConfigDTO';
import { ChartDataConfig, ChartDataSectionField } from 'app/types/ChartConfig';
import { CHART_SPEC_VERSION, ChartSpec, FieldBinding } from '../core/ChartSpec';

const toBinding = (field: ChartDataSectionField): FieldBinding => ({
  fieldId: field.fieldId || field.colName,
  fieldName: field.displayName || field.customName || field.colName,
  alias: field.alias?.name,
  aggregate: field.aggregate,
});

const rowsByType = (datas: ChartDataConfig[] = [], type: string) =>
  datas.filter(item => item.type === type).flatMap(item => item.rows || []);

const sectionValues = (sections: ChartStyleConfigDTO[] = []) =>
  Object.fromEntries(
    sections.map(section => [
      section.key,
      section.rows?.length ? sectionValues(section.rows) : section.value,
    ]),
  );

export const legacyConfigToChartSpec = (
  chartType: string,
  chartConfig: ChartConfigDTO = {},
  datasetId?: string,
): ChartSpec => {
  const datas = (chartConfig.datas || []) as ChartDataConfig[];
  const dimensions = rowsByType(datas, ChartDataSectionType.Group).map(toBinding);
  const measures = rowsByType(datas, ChartDataSectionType.Aggregate).map(toBinding);
  const color = rowsByType(datas, ChartDataSectionType.Color).map(toBinding);
  const allRows = datas.flatMap(item => item.rows || []);

  return {
    version: CHART_SPEC_VERSION,
    type: chartType,
    datasetId,
    dimensions,
    measures,
    filters: allRows
      .filter(field => Boolean(field.filter?.condition))
      .map(field => ({
        fieldId: field.fieldId || field.colName,
        operator: String(
          field.filter?.condition?.operator || field.filter?.condition?.type || 'filter',
        ),
        value: field.filter?.condition?.value,
      })),
    sorts: allRows
      .filter(field => Boolean(field.sort?.type))
      .map(field => ({
        fieldId: field.fieldId || field.colName,
        direction: String(field.sort?.type).toUpperCase().includes('DESC') ? 'DESC' : 'ASC',
      })),
    encoding: {
      x: dimensions,
      y: measures,
      color,
    },
    options: {
      ...sectionValues(chartConfig.styles),
      settings: sectionValues(chartConfig.settings),
    },
    interactions: sectionValues(chartConfig.interactions),
  };
};

export default legacyConfigToChartSpec;
