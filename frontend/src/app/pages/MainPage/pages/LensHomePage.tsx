import {
  BarChartOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Space, Typography } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

export function LensHomePage({ orgId }: { orgId: string }) {
  const navigate = useNavigate();
  const entries = [
    { title: '数据源', desc: '连接并管理 MySQL、StarRocks 等业务数据库', icon: <DatabaseOutlined />, path: 'sources' },
    { title: '数据集', desc: '整理字段语义、计算逻辑和分析模型', icon: <TableOutlined />, path: 'views' },
    { title: '图表与仪表板', desc: '通过拖拽分析数据并构建可视化看板', icon: <BarChartOutlined />, path: 'vizs' },
    { title: '权限管理', desc: '统一管理资源权限与数据权限', icon: <SafetyCertificateOutlined />, path: 'permissions/subject' },
  ];
  return (
    <PageContainer title="首页" subTitle="欢迎使用 DataSphere Lens 企业数据分析平台" style={{ flex: 1, overflow: 'auto' }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={4}>
          <Text type="secondary">DataSphere Lens</Text>
          <Title level={3} style={{ margin: 0 }}>让公司数据更容易被理解和使用</Title>
          <Text type="secondary">从数据源、数据集到图表与仪表板，统一完成企业内部数据分析。</Text>
        </Space>
      </Card>
      <Row gutter={[16, 16]}>
        {entries.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.path}>
            <Card hoverable bordered={false} onClick={() => navigate(`/organizations/${orgId}/${item.path}`)} style={{ height: '100%' }}>
              <Space align="start" size={14}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eaf3ff', color: '#1677ff', display: 'grid', placeItems: 'center', fontSize: 20 }}>{item.icon}</div>
                <div><div style={{ fontWeight: 600, marginBottom: 6 }}>{item.title}</div><Text type="secondary">{item.desc}</Text></div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Card bordered={false} title={<Space><DashboardOutlined />建设路线</Space>} style={{ marginTop: 16 }}>
        <Text type="secondary">当前阶段优先完成：数据源 → 数据集 → 图表 → 仪表板 → 企业权限。产品交互参考 DataEase，底层分析能力继续复用 Datart Core。</Text>
      </Card>
    </PageContainer>
  );
}
