import {
  ApartmentOutlined,
  ConsoleSqlOutlined,
  PartitionOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Space, Tag, Typography } from 'antd';
import { memo } from 'react';
import styled from 'styled-components';

const { Paragraph, Text, Title } = Typography;

interface SelectViewTypeProps {
  selectViewType: (viewType: string) => void;
}

const datasetTypes = [
  {
    key: 'STRUCT',
    title: '表模型',
    description: '从数据源选择表和字段，通过可视化方式快速构建数据集。',
    icon: <PartitionOutlined />,
    tag: '推荐',
    features: ['可视化选表', '字段模型', '无需编写 SQL'],
  },
  {
    key: 'SQL',
    title: 'SQL 数据集',
    description: '编写查询 SQL 构建数据集，适合复杂计算与专业分析场景。',
    icon: <ConsoleSqlOutlined />,
    tag: '专业',
    features: ['SQL 编辑器', '变量参数', '结果预览'],
  },
  {
    key: 'VIEW_JOIN',
    title: '关联数据集',
    description: '基于已有数据集建立关联模型，组合不同业务主题的数据。',
    icon: <ApartmentOutlined />,
    tag: '模型',
    features: ['数据集关联', '多主题组合', '复用已有模型'],
  },
];

const SelectViewType = memo(({ selectViewType }: SelectViewTypeProps) => {
  return (
    <Wrapper>
      <Header>
        <Text type="secondary">数据准备 / 新建数据集</Text>
        <Title level={3}>选择数据集创建方式</Title>
        <Paragraph type="secondary">
          DataSphere Lens 将数据源统一封装为数据集。图表和仪表板只使用数据集，不直接依赖底层数据库表。
        </Paragraph>
      </Header>

      <Row gutter={[20, 20]}>
        {datasetTypes.map(item => (
          <Col key={item.key} xs={24} lg={8}>
            <DatasetCard hoverable onClick={() => selectViewType(item.key)}>
              <CardHeader>
                <IconWrap>{item.icon}</IconWrap>
                <Tag bordered={false} color={item.key === 'STRUCT' ? 'blue' : undefined}>
                  {item.tag}
                </Tag>
              </CardHeader>
              <Title level={4}>{item.title}</Title>
              <Description type="secondary">{item.description}</Description>
              <Space size={[6, 8]} wrap>
                {item.features.map(feature => (
                  <Tag key={feature} bordered={false}>
                    {feature}
                  </Tag>
                ))}
              </Space>
              <Action>
                <span>开始创建</span>
                <RightOutlined />
              </Action>
            </DatasetCard>
          </Col>
        ))}
      </Row>

      <Hint>
        <Text type="secondary">
          创建后可继续配置字段类型、字段显示名、变量、列权限、数据预览和分析入口。
        </Text>
      </Hint>
    </Wrapper>
  );
});

export default SelectViewType;

const Wrapper = styled.div`
  flex: 1;
  padding: 32px;
  overflow: auto;
  background: #f5f7fa;
`;

const Header = styled.div`
  max-width: 760px;
  margin-bottom: 28px;

  h3 {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

const DatasetCard = styled(Card)`
  height: 100%;
  border: 1px solid ${p => p.theme.borderColorSplit};

  .ant-card-body {
    display: flex;
    min-height: 280px;
    flex-direction: column;
    padding: 24px;
  }

  &:hover {
    border-color: ${p => p.theme.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const IconWrap = styled.div`
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  font-size: 24px;
  color: ${p => p.theme.primary};
  background: #eaf3ff;
  border-radius: 12px;
`;

const Description = styled(Paragraph)`
  min-height: 52px;
  margin-bottom: 18px !important;
`;

const Action = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  margin-top: auto;
  font-weight: 500;
  color: ${p => p.theme.primary};
  border-top: 1px solid ${p => p.theme.borderColorSplit};
`;

const Hint = styled.div`
  padding: 16px 20px;
  margin-top: 24px;
  background: #fff;
  border: 1px solid ${p => p.theme.borderColorSplit};
  border-radius: 8px;
`;
