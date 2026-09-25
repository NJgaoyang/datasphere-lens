import {
  ArrowRightOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  PlusOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Steps,
  Tag,
  Typography,
  theme,
} from 'antd';
import React from 'react';
import { uuidv4 } from 'utils/utils';
import { UNPERSISTED_ID_PREFIX } from './ViewPage/constants';
import { useNavigate } from 'react-router-dom';

const { Paragraph, Text, Title } = Typography;

type Entry = {
  title: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
};

export function LensHomePage({ orgId }: { orgId: string }) {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const go = (path: string) => navigate(`/organizations/${orgId}/${path}`);
  const createDataset = () => go(`views/${UNPERSISTED_ID_PREFIX}${uuidv4()}`);
  const createChart = () => go('charts/new?dataChartId=&chartType=dataChart&container=dataChart');
  const createDashboard = () => go('dashboards?create=dashboard');

  const entries: Entry[] = [
    {
      title: '连接数据',
      desc: '接入业务数据库并验证连接',
      path: 'sources',
      icon: <DatabaseOutlined />,
    },
    {
      title: '准备数据集',
      desc: '整理字段、模型与计算口径',
      path: 'views',
      icon: <TableOutlined />,
    },
    {
      title: '创建图表',
      desc: '从数据集快速创建可视化分析',
      path: 'charts',
      icon: <BarChartOutlined />,
    },
    {
      title: '制作仪表板',
      desc: '组合图表构建业务分析看板',
      path: 'dashboards',
      icon: <DashboardOutlined />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        bordered={false}
        styles={{ body: { padding: 32 } }}
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 70%)`,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} lg={13}>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <Tag color="blue" bordered={false}>
                DATASPHERE LENS
              </Tag>
              <Title level={2} style={{ margin: 0, maxWidth: 720 }}>
                把企业数据变成可直接使用的分析资产
              </Title>
              <Paragraph type="secondary" style={{ margin: 0, maxWidth: 700 }}>
                从数据连接、数据准备到图表和仪表板，用一条清晰链路完成内部 BI 分析。
              </Paragraph>
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={createDataset}
                >
                  新建数据集
                </Button>
                <Button size="large" onClick={() => go('charts')}>
                  查看图表
                </Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={11}>
            <Card size="small" bordered={false}>
              <Steps
                responsive={false}
                current={3}
                items={[
                  { title: '数据源', icon: <DatabaseOutlined /> },
                  { title: '数据集', icon: <TableOutlined /> },
                  { title: '图表', icon: <BarChartOutlined /> },
                  { title: '仪表板', icon: <DashboardOutlined /> },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Flex align="end" justify="space-between" style={{ margin: '28px 0 14px' }}>
        <div>
          <Text type="secondary">快速开始</Text>
          <Title level={4} style={{ margin: '4px 0 0' }}>
            你今天想做什么？
          </Title>
        </div>
      </Flex>

      <Row gutter={[16, 16]}>
        {entries.map(entry => (
          <Col xs={24} sm={12} xl={6} key={entry.path}>
            <Card
              hoverable
              onClick={() => go(entry.path)}
              styles={{ body: { minHeight: 132, padding: 20 } }}
            >
              <Flex vertical gap={12}>
                <Flex align="center" justify="space-between">
                  <div
                    style={{
                      display: 'grid',
                      width: 40,
                      height: 40,
                      placeItems: 'center',
                      color: token.colorPrimary,
                      fontSize: 18,
                      background: token.colorPrimaryBg,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    {entry.icon}
                  </div>
                  <ArrowRightOutlined style={{ color: token.colorTextTertiary }} />
                </Flex>
                <div>
                  <Text strong>{entry.title}</Text>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                    {entry.desc}
                  </Paragraph>
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="核心链路" extra={<Tag color="blue">BI Core</Tag>}>
            <Title level={4} style={{ marginTop: 0 }}>
              数据源 → 数据集 → 图表 → 仪表板
            </Title>
            <Paragraph type="secondary">
              所有可视化都基于数据集，不让图表直接耦合业务数据库表，后续权限、指标和 AI 才能统一治理。
            </Paragraph>
            <Button type="link" style={{ paddingInline: 0 }} onClick={() => go('views')}>
              管理数据集 <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快捷创建">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Button block onClick={() => go('sources/add')}>新建数据源</Button>
              <Button block onClick={createDataset}>新建数据集</Button>
              <Button block onClick={createChart}>新建图表</Button>
              <Button block type="primary" onClick={createDashboard}>新建仪表板</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
