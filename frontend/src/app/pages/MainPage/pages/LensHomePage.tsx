import {
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
  Empty,
  Flex,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uuidv4 } from 'utils/utils';
import { useSourceSlice } from './SourcePage/slice';
import { selectSources } from './SourcePage/slice/selectors';
import { getSources } from './SourcePage/slice/thunks';
import { UNPERSISTED_ID_PREFIX } from './ViewPage/constants';
import { selectViews } from './ViewPage/slice/selectors';
import { getViews } from './ViewPage/slice/thunks';
import { selectVizs } from './VizPage/slice/selectors';
import { getFolders } from './VizPage/slice/thunks';

const { Text, Title } = Typography;

export function LensHomePage({ orgId }: { orgId: string }) {
  useSourceSlice();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sources = useSelector(selectSources) || [];
  const views = useSelector(selectViews) || [];
  const vizs = useSelector(selectVizs) || [];
  const go = (path: string) => navigate(`/organizations/${orgId}/${path}`);

  useEffect(() => {
    if (!orgId) return;
    dispatch(getSources(orgId));
    dispatch(getViews(orgId));
    dispatch(getFolders(orgId));
  }, [dispatch, orgId]);

  const createDataset = () => go(`views/${UNPERSISTED_ID_PREFIX}${uuidv4()}`);
  const createChart = () =>
    go('charts/new?dataChartId=&chartType=dataChart&container=dataChart');
  const createDashboard = () => go('dashboards?create=dashboard');

  const resourceStats = useMemo(
    () => [
      {
        title: '数据源',
        value: sources.filter(item => !item.isFolder).length,
        icon: <DatabaseOutlined />,
        onClick: () => go('sources'),
      },
      {
        title: '数据集',
        value: views.filter(item => !item.isFolder).length,
        icon: <TableOutlined />,
        onClick: () => go('views'),
      },
      {
        title: '图表',
        value: vizs.filter(item => item.relType === 'DATACHART').length,
        icon: <BarChartOutlined />,
        onClick: () => go('charts'),
      },
      {
        title: '仪表板',
        value: vizs.filter(item => item.relType === 'DASHBOARD').length,
        icon: <DashboardOutlined />,
        onClick: () => go('dashboards'),
      },
    ],
    [sources, views, vizs],
  );

  const recentAnalysis = useMemo(
    () =>
      [...vizs]
        .filter(item => ['DATACHART', 'DASHBOARD'].includes(item.relType))
        .sort((a, b) =>
          String(b.updateTime || b.createTime || '').localeCompare(
            String(a.updateTime || a.createTime || ''),
          ),
        )
        .slice(0, 6),
    [vizs],
  );

  return (
    <div style={{ padding: 20 }}>
      <Flex align="center" justify="space-between" gap={16} wrap="wrap">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            工作台
          </Title>
          <Text type="secondary">
            从数据连接、数据准备到图表和仪表板，继续你的分析工作。
          </Text>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} onClick={createDataset}>
            新建数据集
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={createChart}>
            新建图表
          </Button>
        </Space>
      </Flex>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        {resourceStats.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card
              size="small"
              hoverable
              onClick={item.onClick}
              styles={{ body: { padding: 16 } }}
            >
              <Flex align="center" justify="space-between">
                <Statistic title={item.title} value={item.value} />
                <div style={{ fontSize: 20, color: '#1677ff' }}>{item.icon}</div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card
            size="small"
            title="最近分析"
            extra={
              <Button type="link" size="small" onClick={() => go('charts')}>
                查看全部
              </Button>
            }
          >
            {recentAnalysis.length ? (
              <List
                dataSource={recentAnalysis}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        key="open"
                        type="link"
                        size="small"
                        onClick={() =>
                          go(
                            `${item.relType === 'DATACHART' ? 'charts' : 'dashboards'}/${item.relId}`,
                          )
                        }
                      >
                        打开
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.relType === 'DATACHART' ? (
                          <BarChartOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                        ) : (
                          <DashboardOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                        )
                      }
                      title={item.name}
                      description={
                        <Space size={8}>
                          <Tag bordered={false}>
                            {item.relType === 'DATACHART' ? '图表' : '仪表板'}
                          </Tag>
                          <Text type="secondary">
                            {item.updateTime || item.createTime || '最近更新'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="还没有分析内容"
              >
                <Button type="primary" onClick={createChart}>
                  创建第一个图表
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" title="快速创建">
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Button block icon={<DatabaseOutlined />} onClick={() => go('sources/add')}>
                  新建数据源
                </Button>
                <Button block icon={<TableOutlined />} onClick={createDataset}>
                  新建数据集
                </Button>
                <Button block icon={<BarChartOutlined />} onClick={createChart}>
                  新建图表
                </Button>
                <Button
                  block
                  type="primary"
                  icon={<DashboardOutlined />}
                  onClick={createDashboard}
                >
                  新建仪表板
                </Button>
              </Space>
            </Card>

            <Card size="small" title="BI 工作流">
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Text>1. 连接 MySQL / StarRocks</Text>
                <Text>2. 建模并保存数据集</Text>
                <Text>3. 创建可视化图表</Text>
                <Text>4. 组合图表发布仪表板</Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
