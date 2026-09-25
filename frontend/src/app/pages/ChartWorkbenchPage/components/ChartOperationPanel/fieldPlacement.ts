import {
  ChartDataSectionType,
  ChartDataViewFieldCategory,
  DataViewFieldType,
} from 'app/constants';
import { ChartConfig, ChartDataConfig } from 'app/types/ChartConfig';
import { ChartDataViewMeta } from 'app/types/ChartDataViewMeta';
import {
  buildDragItem,
  isUnderUpperBound,
  reachLowerBoundCount,
} from 'app/utils/internalChartHelper';
import { uuidv4 } from 'utils/utils';
import { getDefaultAggregate } from './components/ChartDraggable/utils';

export type FieldPlacement = {
  sectionIndex: number;
  section: ChartDataConfig;
};

const SECTION_PRIORITY: Record<string, number> = {
  [ChartDataSectionType.Group]: 10,
  [ChartDataSectionType.Aggregate]: 10,
  [ChartDataSectionType.Mixed]: 20,
  [ChartDataSectionType.Color]: 30,
  [ChartDataSectionType.Size]: 30,
  [ChartDataSectionType.Info]: 40,
  [ChartDataSectionType.Filter]: 50,
};

function supportsField(
  section: ChartDataConfig,
  field: ChartDataViewMeta,
  aggregation: boolean,
) {
  const rows = section.rows || [];
  if (!isUnderUpperBound(section.limit, rows.length + 1)) return false;
  if (
    section.disableAggregateComputedField &&
    field.category === ChartDataViewFieldCategory.AggregateComputedField
  ) {
    return false;
  }
  if (
    typeof section.actions === 'object' &&
    !Array.isArray(section.actions) &&
    field.type &&
    !(field.type in section.actions)
  ) {
    return false;
  }
  if (!section.allowSameField || aggregation) {
    if (rows.some(row => row.colName === field.name)) return false;
  }
  return true;
}

function scoreSection(
  section: ChartDataConfig,
  field: ChartDataViewMeta,
  aggregation: boolean,
) {
  const numeric = field.type === DataViewFieldType.NUMERIC;
  const preferredType = numeric
    ? ChartDataSectionType.Aggregate
    : ChartDataSectionType.Group;
  const missingRequired = Math.max(
    0,
    reachLowerBoundCount(section.limit, section.rows?.length || 0),
  );
  let score = SECTION_PRIORITY[section.type || ''] ?? 100;
  if (section.type === preferredType) score -= 20;
  if (section.required || missingRequired > 0) score -= 10;
  if (!section.rows?.length) score -= 3;
  if (
    numeric &&
    aggregation &&
    section.type === ChartDataSectionType.Group
  ) {
    score += 25;
  }
  return score;
}

export function placeFieldInChartConfig(
  chartConfig: ChartConfig | undefined,
  field: ChartDataViewMeta,
  aggregation = true,
): FieldPlacement | undefined {
  if (!field?.name || !field.type) return undefined;
  const candidates = (chartConfig?.datas || [])
    .map((section, sectionIndex) => ({ section, sectionIndex }))
    .filter(({ section }) => supportsField(section, field, aggregation))
    .sort((a, b) =>
      scoreSection(a.section, field, aggregation) -
      scoreSection(b.section, field, aggregation),
    );
  const target = candidates[0];
  if (!target) return undefined;
  const dragItem = buildDragItem(field);
  const row = {
    uid: uuidv4(),
    ...dragItem,
    aggregate: getDefaultAggregate(dragItem, target.section),
  };
  return {
    sectionIndex: target.sectionIndex,
    section: {
      ...target.section,
      rows: [...(target.section.rows || []), row],
    },
  };
}
