import {
  BarChartOutlined,
  DashboardOutlined,
  FolderAddOutlined,
  FolderOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  message,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useAccess } from 'app/pages/MainPage/Access';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PermissionLevels, ResourceTypes } from '../PermissionPage/constants';
import { useAddViz } from './hooks/useAddViz';
import { SaveFormContext } from './SaveFormContext';
import { selectVizListLoading, selectVizs } from './slice/selectors';
import { deleteViz, getFolders } from './slice/thunks';
import { FolderViewModel, VizType } from './slice/types';

const { Text } = Typography;

type AssetFilter = 'ALL' | 'DATACHART' | 'DASHBOARD' | 'FOLDER';

const typeMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  DATACHART: { label: '图表', icon: <BarChartOutlined /> },
  DASHBOARD: { label: '仪表板', icon: <DashboardOutlined /> },
  FOLDER: { label: '文件夹', icon: <FolderOutlined /> },
};

export function LensVizHub() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const orgId = useSelector(selectOrgId);
  const vizs = useSelector(selectVizs);
  const loading = useSelector(selectVizListLoading);
  const { showSaveForm } = useContext(SaveFormContext);
  const addViz = useAddViz({ showSaveForm });
  const routeFilter: AssetFilter | null = location.pathname.endsWith('/charts')
    ? 'DATACHART'
    : location.pathname.endsWith('/dashboards')
      ? 'DASHBOARD'
      : null;
  const [folderId, setFolderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AssetFilter>(routeFilter || 'ALL');
  const createTriggeredRef = useRef(false);
  const [keyword, setKeyword] = useState('');
  const canCreate = useAccess({
    module: ResourceTypes.Viz,
    level: PermissionLevels.Create,
  });

  useEffect(() => {
    if (orgId) dispatch(getFolders(orgId));
  }, [dispatch, orgId]);

  const assets = useMemo(
    () =>
      routeFilter
        ? vizs.filter(item => item.relType === routeFilter)
        : vizs.filter(item => item.parentId === folderId),
    [folderId, routeFilter, vizs],
  );
  const currentFolder = useMemo(
    () => vizs.find(item => item.id === folderId),
    [folderId, vizs],
  );
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return assets.filter(item => {
      const effectiveFilter = routeFilter || filter;
      const matchesType =
        effectiveFilter === 'ALL' || item.relType === effectiveFilter;
      const matchesKeyword = !q || item.name.toLowerCase().includes(q);
      return matchesType && matchesKeyword;
    });
  }, [assets, filter, keyword, routeFilter]);

  const openAsset = useCallback(
    (item: FolderViewModel) => {
      if (item.relType === 'FOLDER') {
        setFolderId(item.id);
        return;
      }
      const prefix = item.relType === 'DATACHART' ? 'charts' : 'dashboards';
      navigate(`/organizations/${orgId}/${prefix}/${item.relId}`);
    },
    [navigate, orgId],
  );

  const createChart = useCallback(() => {
    navigate(
      `/organizations/${orgId}/charts/new?dataChartId=&chartType=dataChart&container=dataChart`,
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
            navigate(`/organizations/${orgId}/dashboards/${resource.relId}/boardEditor`);
          }
        },
      });
    },
    [addViz, folderId, navigate, orgId],
  );

  const editAsset = useCallback(
    (item: FolderViewModel) => {
      if (item.relType === 'DATACHART') {
        navigate(
          `/organizations/${orgId}/charts/new?dataChartId=${item.relId}&chartType=dataChart&container=dataChart`,
        );
        return;
      }
      if (item.relType === 'DASHBOARD') {
        navigate(`/organizations/${orgId}/dashboards/${item.relId}/boardEditor`);
        return;
      }
      setFolderId(item.id);
    },
    [navigate, orgId],
  );

  const archiveAsset = useCallback(
    (item: FolderViewModel) => {
      const archive = ['DATACHART', 'DASHBOARD'].includes(item.relType);
      const id = archive ? item.relId : item.id;
      dispatch(
        deleteViz({
          params: { id, archive },
          type: item.relType,
          resolve: () =>
            message.success(archive ? '已移入回收站' : '文件夹已删除'),
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (
      searchParams.get('create') === 'dashboard' &&
      !createTriggeredRef.current &&
      canCreate({})
    ) {
      createTriggeredRef.current = true;
      createResource('DASHBOARD');
      const next = new URLSearchParams(searchParams);
      next.delete('create');
      setSearchParams(next, { replace: true });
    }
  }, [canCreate, createResource, searchParams, setSearchParams]);

  const pageTitle =
    routeFilter === 'DATACHART'
      ? '图表'
      : routeFilter === 'DASHBOARD'
        ? '仪表板'
        : '分析资产';
  const pageSubtitle =
    routeFilter === 'DATACHART'
      ? '基于数据集创建和管理可视化图表'
      : routeFilter === 'DASHBOARD'
        ? '组合多个图表，构建业务分析看板'
        : '统一管理图表、仪表板与分析文件夹';

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



  return (
    <PageContainer
      title={pageTitle}
      subTitle={pageSubtitle}
      style={{ flex: 1, overflow: 'auto' }}
      extra={[
        routeFilter === 'DATACHART' ? (
          <Button
            key="create-chart"
            type="primary"
            icon={<PlusOutlined />}
            disabled={!canCreate({})}
            onClick={createChart}
          >
            新建图表
          </Button>
        ) : routeFilter === 'DASHBOARD' ? (
          <Button
            key="create-dashboard"
            type="primary"
            icon={<PlusOutlined />}
            disabled={!canCreate({})}
            onClick={() => createResource('DASHBOARD')}
          >
            新建仪表板
          </Button>
        ) : (
          <Dropdown key="create" menu={createMenu} disabled={!canCreate({})}>
            <Button type="primary" icon={<PlusOutlined />}>
              新建分析
            </Button>
          </Dropdown>
        ),
      ]}
    >
      <Card size="small">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 12,
          }}
        >
          <Space size={8}>
            {!routeFilter && (
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
            )}
            {currentFolder && (
              <Button type="link" size="small" onClick={() => setFolderId(null)}>
                返回全部资产
              </Button>
            )}
          </Space>
          <Input
            allowClear
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder={
              routeFilter === 'DATACHART'
                ? '搜索图表'
                : routeFilter === 'DASHBOARD'
                  ? '搜索仪表板'
                  : '搜索分析资产'
            }
            style={{ width: 300 }}
          />
        </div>

        <Table<FolderViewModel>
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  keyword
                    ? `没有匹配的${pageTitle}`
                    : routeFilter
                      ? `还没有${pageTitle}`
                      : '当前目录还没有分析资产'
                }
              >
                {canCreate({}) &&
                  (routeFilter === 'DASHBOARD' ? (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => createResource('DASHBOARD')}
                    >
                      创建第一个仪表板
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={createChart}
                    >
                      创建第一个图表
                    </Button>
                  ))}
              </Empty>
            ),
          }}
          onRow={item => ({ onDoubleClick: () => openAsset(item) })}
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
              width: '34%',
              render: (_, item) => {
                const meta = typeMeta[item.relType] || {
                  label: item.relType,
                  icon: <BarChartOutlined />,
                };
                return (
                  <Space size={10}>
                    <span style={{ color: '#1677ff' }}>{meta.icon}</span>
                    <Button
                      type="link"
                      size="small"
                      style={{ height: 'auto', padding: 0, fontWeight: 600 }}
                      onClick={() => openAsset(item)}
                    >
                      {item.name}
                    </Button>
                  </Space>
                );
              },
            },
            {
              title: '类型',
              key: 'type',
              width: 120,
              render: (_, item) => (
                <Tag bordered={false}>
                  {typeMeta[item.relType]?.label || item.relType}
                </Tag>
              ),
            },
            {
              title: '状态',
              key: 'status',
              width: 120,
              render: (_, item) =>
                item.relType === 'FOLDER' ? (
                  <Text type="secondary">—</Text>
                ) : item.status === 2 ? (
                  <Tag color="success" bordered={false}>
                    已发布
                  </Tag>
                ) : (
                  <Tag bordered={false}>草稿</Tag>
                ),
            },
            {
              title: '更新时间',
              key: 'updateTime',
              render: (_, item) => (
                <Text type="secondary">{item.updateTime || item.createTime || '—'}</Text>
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 220,
              align: 'right',
              render: (_, item) => (
                <Space size={2}>
                  <Button type="link" size="small" onClick={() => editAsset(item)}>
                    {item.relType === 'FOLDER' ? '打开' : '编辑'}
                  </Button>
                  <Popconfirm
                    title={
                      item.relType === 'FOLDER'
                        ? '确认删除该文件夹？'
                        : `确认将该${typeMeta[item.relType]?.label || '资源'}移入回收站？`
                    }
                    onConfirm={() => archiveAsset(item)}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      loading={item.deleteLoading}
                      icon={<DeleteOutlined />}
                    >
                      {item.relType === 'FOLDER' ? '删除' : '归档'}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );

}
