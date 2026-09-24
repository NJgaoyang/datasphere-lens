import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  Row,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import { useAccess } from 'app/pages/MainPage/Access';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PermissionLevels, ResourceTypes } from '../PermissionPage/constants';
import { useAddViz } from './hooks/useAddViz';
import { SaveFormContext } from './SaveFormContext';
import { selectVizListLoading, selectVizs } from './slice/selectors';
import { getFolders } from './slice/thunks';
import { FolderViewModel, VizType } from './slice/types';

const { Text, Title } = Typography;

type AssetFilter = 'ALL' | 'DATACHART' | 'DASHBOARD' | 'FOLDER';

const typeMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  DATACHART: { label: '图表', icon: <BarChartOutlined /> },
  DASHBOARD: { label: '仪表板', icon: <DashboardOutlined /> },
  FOLDER: { label: '文件夹', icon: <FolderOutlined /> },
};

export function LensVizHub() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  const vizs = useSelector(selectVizs);
  const loading = useSelector(selectVizListLoading);
  const { token } = theme.useToken();
  const { showSaveForm } = useContext(SaveFormContext);
  const addViz = useAddViz({ showSaveForm });
  const [folderId, setFolderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AssetFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const canCreate = useAccess({
    module: ResourceTypes.Viz,
    level: PermissionLevels.Create,
  });

  useEffect(() => {
    if (orgId) dispatch(getFolders(orgId));
  }, [dispatch, orgId]);

  const assets = useMemo(
    () => vizs.filter(item => item.parentId === folderId),
    [folderId, vizs],
  );
  const chartCount = useMemo(
    () => vizs.filter(item => item.relType === 'DATACHART').length,
    [vizs],
  );
  const dashboardCount = useMemo(
    () => vizs.filter(item => item.relType === 'DASHBOARD').length,
    [vizs],
  );
  const folderCount = useMemo(
    () => vizs.filter(item => item.relType === 'FOLDER').length,
    [vizs],
  );
  const currentFolder = useMemo(
    () => vizs.find(item => item.id === folderId),
    [folderId, vizs],
  );
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return assets.filter(item => {
      const matchesType = filter === 'ALL' || item.relType === filter;
      const matchesKeyword = !q || item.name.toLowerCase().includes(q);
      return matchesType && matchesKeyword;
    });
  }, [assets, filter, keyword]);

  const openAsset = useCallback(
    (item: FolderViewModel) => {
      if (item.relType === 'FOLDER') {
        setFolderId(item.id);
        return;
      }
      navigate(`/organizations/${orgId}/vizs/${item.relId}`);
    },
    [navigate, orgId],
  );

  const createChart = useCallback(() => {
    navigate(
      `/organizations/${orgId}/vizs/chartEditor?dataChartId=&chartType=dataChart&container=dataChart`,
    );
  }, [navigate, orgId]);

  const createResource = useCallback(
    (type: VizType) => {
      addViz({
        vizType: type,
        type: CommonFormTypes.Add,
        visible: true,
        initialValues: { parentId: folderId },
        callback: resource => {
          if (type === 'DASHBOARD' && resource?.relId) {
            navigate(`/organizations/${orgId}/vizs/${resource.relId}`);
          }
        },
      });
    },
    [addViz, folderId, navigate, orgId],
  );

  const createMenu = {
    items: [
      { key: 'chart', label: '图表', icon: <BarChartOutlined /> },
      { key: 'dashboard', label: '仪表板', icon: <DashboardOutlined /> },
      { key: 'folder', label: '文件夹', icon: <FolderAddOutlined /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'chart') createChart();
      if (key === 'dashboard') createResource('DASHBOARD');
      if (key === 'folder') createResource('FOLDER');
    },
  };

  const statisticCards = [
    { title: '图表', value: chartCount, icon: <BarChartOutlined />, color: token.colorPrimary },
    { title: '仪表板', value: dashboardCount, icon: <DashboardOutlined />, color: token.colorPurple },
    { title: '文件夹', value: folderCount, icon: <FolderOutlined />, color: token.colorWarning },
  ];

  return (
    <PageContainer
      title="分析资产"
      subTitle="统一管理图表、仪表板与分析文件夹"
      style={{ flex: 1, overflow: 'auto' }}
      extra={[
        <Dropdown key="create" menu={createMenu} disabled={!canCreate({})}>
          <Button type="primary" icon={<PlusOutlined />}>
            新建分析
          </Button>
        </Dropdown>,
      ]}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statisticCards.map(item => (
          <Col xs={24} md={8} key={item.title}>
            <Card>
              <Space size={14} align="center">
                <div
                  style={{
                    display: 'grid',
                    width: 42,
                    height: 42,
                    placeItems: 'center',
                    fontSize: 18,
                    color: item.color,
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  {item.icon}
                </div>
                <Statistic title={item.title} value={item.value} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <Space size={4}>
            <Button type="link" style={{ paddingInline: 0 }} onClick={() => setFolderId(null)}>
              全部资产
            </Button>
            {currentFolder && (
              <>
                <Text type="secondary">/</Text>
                <Text strong>{currentFolder.name}</Text>
              </>
            )}
          </Space>
        }
        extra={
          <Space wrap>
            <Segmented
              value={filter}
              onChange={value => setFilter(value as AssetFilter)}
              options={[
                { label: '全部', value: 'ALL' },
                { label: '图表', value: 'DATACHART' },
                { label: '仪表板', value: 'DASHBOARD' },
                { label: '文件夹', value: 'FOLDER' },
              ]}
            />
            <Input
              allowClear
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="搜索分析资产"
              style={{ width: 240 }}
            />
          </Space>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : filtered.length ? (
          <Row gutter={[16, 16]}>
            {filtered.map(item => {
              const meta = typeMeta[item.relType] || {
                label: item.relType,
                icon: <AppstoreOutlined />,
              };
              return (
                <Col xs={24} sm={12} xl={8} xxl={6} key={item.id}>
                  <Card
                    hoverable
                    onClick={() => openAsset(item)}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'grid',
                          height: 116,
                          placeItems: 'center',
                          fontSize: 32,
                          color: token.colorPrimary,
                          background: token.colorFillAlter,
                          borderRadius: token.borderRadiusLG,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <Space size={8}>
                        <Tag bordered={false}>{meta.label}</Tag>
                        {item.relType === 'FOLDER' && <FolderOpenOutlined />}
                      </Space>
                      <div>
                        <Title level={5} ellipsis style={{ margin: 0 }}>
                          {item.name}
                        </Title>
                        <Text type="secondary">
                          {item.relType === 'FOLDER'
                            ? '打开文件夹查看分析资产'
                            : item.relType === 'DATACHART'
                              ? '数据集驱动的可视化分析'
                              : '多图表组合分析看板'}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={keyword ? '没有匹配的分析资产' : '当前目录还没有分析资产'}
          >
            {canCreate({}) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={createChart}>
                创建第一个图表
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </PageContainer>
  );
}
