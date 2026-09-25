import {
  countConfigLeaves,
  getDefaultExpandedConfigKeys,
  getVisibleConfigItems,
} from '../config/configPanelUtils';

describe('config panel utils', () => {
  const configs: any[] = [
    {
      key: 'basic',
      label: '基础样式',
      comType: 'group',
      rows: [
        { key: 'label', label: '标签', comType: 'switch' },
        { key: 'tooltip', label: '提示', comType: 'switch' },
      ],
    },
    {
      key: 'axis',
      label: '坐标轴',
      comType: 'group',
      rows: [{ key: 'x', label: 'X', comType: 'switch' }],
    },
    { key: 'advanced', label: '高级', comType: 'group', rows: [] },
    { key: 'hidden', label: '隐藏', comType: 'group', hidden: true },
  ];

  it('filters hidden config items', () => {
    expect(getVisibleConfigItems(configs).map(item => item.key)).toEqual([
      'basic',
      'axis',
      'advanced',
    ]);
  });

  it('counts visible leaf settings', () => {
    expect(countConfigLeaves(configs[0])).toBe(2);
    expect(countConfigLeaves(configs[2])).toBe(1);
  });

  it('opens the first two visible groups by default', () => {
    expect(getDefaultExpandedConfigKeys(configs)).toEqual(['basic', 'axis']);
  });
});
