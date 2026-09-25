import { filterLayerTree } from '../../pages/BoardEditor/components/LayerPanel/utils';
import { describe, expect, it } from 'vitest';

const tree: any[] = [
  {
    key: 'group',
    title: '销售分析',
    originalType: 'group',
    children: [
      { key: 'chart', title: '月度趋势', originalType: 'chart', children: [] },
      { key: 'filter', title: '区域筛选', originalType: 'controller', children: [] },
    ],
  },
  { key: 'text', title: '说明文字', originalType: 'richText', children: [] },
];

describe('filterLayerTree', () => {
  it('matches layer names and preserves parents of matching children', () => {
    const result = filterLayerTree(tree, '趋势');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('group');
    expect(result[0].children.map(child => child.key)).toEqual(['chart']);
  });

  it('matches resolved widget type names', () => {
    const result = filterLayerTree(tree, '筛选器', node =>
      node.originalType === 'controller' ? '筛选器' : node.originalType,
    );
    expect(result[0].children[0].key).toBe('filter');
  });

  it('returns original tree for blank search', () => {
    expect(filterLayerTree(tree, '  ')).toBe(tree);
  });
});
