import { Table } from 'antd';
import { FC, useMemo } from 'react';
import { VisualRendererProps } from '../../registry/RendererRegistry';

const TableRenderer: FC<VisualRendererProps> = ({ dataset, style }) => {
  const columns = useMemo(
    () =>
      (dataset?.columns || []).map((column, index) => ({
        key: `${index}`,
        title: column.name || `Column ${index + 1}`,
        dataIndex: `${index}`,
      })),
    [dataset?.columns],
  );

  const dataSource = useMemo(
    () =>
      (dataset?.rows || []).map((row, rowIndex) => ({
        key: `${rowIndex}`,
        ...Object.fromEntries(row.map((value, index) => [`${index}`, value])),
      })),
    [dataset?.rows],
  );

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', ...style }}>
      <Table columns={columns} dataSource={dataSource} pagination={false} size="small" />
    </div>
  );
};

export default TableRenderer;
