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
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useAccess } from 'app/pages/MainPage/Access';
import { PermissionLevels, ResourceTypes } from '../PermissionPage/constants';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAddViz } from './hooks/useAddViz';
import { SaveFormContext } from './SaveFormContext';
import {
  selectVizListLoading,
  selectVizs,
} from './slice/selectors';
import { getFolders } from './slice/thunks';
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
  const orgId = useSelector(selectOrgId);
  const vizs = useSelector(selectVizs);
  const loading = useSelector(selectVizListLoading);
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
  return (
    <Page>
      <Hero>
        <div>
          <Eyebrow>ANALYTICS WORKSPACE</Eyebrow>
          <h1>分析资产</h1>
          <p>从数据集出发创建图表，组合成仪表板，并统一管理分析内容。</p>
        </div>
        <Dropdown menu={createMenu} disabled={!canCreate({})}>
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            新建分析
          </Button>
        </Dropdown>
      </Hero>

      <MetricGrid>
        <MetricCard>
          <MetricIcon className="chart"><BarChartOutlined /></MetricIcon>
          <div><span>图表</span><strong>{chartCount}</strong></div>
        </MetricCard>
        <MetricCard>
          <MetricIcon className="dashboard"><DashboardOutlined /></MetricIcon>
          <div><span>仪表板</span><strong>{dashboardCount}</strong></div>
        </MetricCard>
        <MetricCard>
          <MetricIcon className="folder"><FolderOutlined /></MetricIcon>
          <div><span>文件夹</span><strong>{folderCount}</strong></div>
        </MetricCard>
      </MetricGrid>

      <Workspace>
        <Toolbar>
          <PathGroup>
            <Button type="text" onClick={() => setFolderId(null)}>全部资产</Button>
            {currentFolder && (
              <>
                <span>/</span>
                <strong>{currentFolder.name}</strong>
              </>
            )}
          </PathGroup>
          <ToolActions>
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
            />
          </ToolActions>
        </Toolbar>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : filtered.length ? (
          <AssetGrid>
            {filtered.map(item => {
              const meta = typeMeta[item.relType] || {
                label: item.relType,
                icon: <AppstoreOutlined />,
              };
              return (
                <AssetCard key={item.id} hoverable onClick={() => openAsset(item)}>
                  <AssetPreview className={item.relType.toLowerCase()}>
                    <span>{meta.icon}</span>
                    {item.relType === 'DATACHART' && <MiniBars><i /><i /><i /><i /></MiniBars>}
                    {item.relType === 'DASHBOARD' && <MiniDashboard><i /><i /><i /></MiniDashboard>}
                  </AssetPreview>
                  <AssetBody>
                    <Space size={8}>
                      <Tag bordered={false}>{meta.label}</Tag>
                      {item.relType === 'FOLDER' && <FolderOpenOutlined />}
                    </Space>
                    <h3>{item.name}</h3>
                    <Text type="secondary">
                      {item.relType === 'FOLDER'
                        ? '打开文件夹查看分析资产'
                        : item.relType === 'DATACHART'
                          ? '数据集驱动的可视化分析'
                          : '多图表组合分析看板'}
                    </Text>
                  </AssetBody>
                </AssetCard>
              );
            })}
          </AssetGrid>
        ) : (
          <EmptyWrap>
            <Empty description={keyword ? '没有匹配的分析资产' : '当前目录还没有分析资产'}>
              {canCreate({}) && (
                <Button type="primary" icon={<PlusOutlined />} onClick={createChart}>
                  创建第一个图表
                </Button>
              )}
            </Empty>
          </EmptyWrap>
        )}
      </Workspace>
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  height: 100%;
  padding: 28px;
  overflow: auto;
`;

const Hero = styled.section`
  display: flex;
  gap: 24px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
  h1 {
    margin: 4px 0 6px;
    font-size: 28px;
    line-height: 36px;
    color: #182230;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #667085;
  }
`;

const Eyebrow = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #6d5dfc;
  letter-spacing: 0.12em;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 86px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 14px;
  span {
    display: block;
    font-size: 11px;
    color: #98a2b3;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 24px;
    line-height: 28px;
    color: #182230;
  }
`;

const MetricIcon = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 42px;
  height: 42px;
  font-size: 18px;
  border-radius: 12px;

  &.chart { color: #2563eb; background: #eff6ff; }
  &.dashboard { color: #7c3aed; background: #f5f3ff; }
  &.folder { color: #d97706; background: #fffbeb; }
`;

const Workspace = styled.section`
  min-height: 420px;
  padding: 18px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 16px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;
const PathGroup = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #98a2b3;

  strong {
    color: #344054;
  }
`;

const ToolActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  .ant-input-affix-wrapper {
    width: 240px;
  }
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const AssetCard = styled(Card)`
  overflow: hidden;
  border-color: #eaecf0;
  border-radius: 14px;

  .ant-card-body {
    padding: 0;
  }
`;
const AssetPreview = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  height: 126px;
  overflow: hidden;
  font-size: 28px;
  color: #64748b;
  background: linear-gradient(145deg, #f8fafc, #eef2f7);
  border-bottom: 1px solid #eef1f5;

  &.datachart { background: linear-gradient(145deg, #eff6ff, #eef2ff); }
  &.dashboard { background: linear-gradient(145deg, #f5f3ff, #f8fafc); }
  &.folder { background: linear-gradient(145deg, #fffbeb, #fff7ed); }
`;

const MiniBars = styled.div`
  position: absolute;
  right: 18px;
  bottom: 16px;
  left: 18px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: center;
  height: 54px;

  i {
    width: 16px;
    background: rgba(37, 99, 235, 0.23);
    border-radius: 4px 4px 1px 1px;
  }

  i:nth-child(1) { height: 32%; }
  i:nth-child(2) { height: 64%; }
  i:nth-child(3) { height: 88%; }
  i:nth-child(4) { height: 52%; }
`;

const MiniDashboard = styled.div`
  position: absolute;
  right: 18px;
  bottom: 16px;
  left: 18px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 6px;
  i {
    min-height: 22px;
    background: rgba(124, 58, 237, 0.09);
    border: 1px solid rgba(124, 58, 237, 0.12);
    border-radius: 5px;
  }

  i:first-child {
    grid-row: span 2;
  }
`;

const AssetBody = styled.div`
  padding: 14px 15px 16px;

  h3 {
    margin: 10px 0 4px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 650;
    color: #1d2939;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-typography {
    display: block;
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const EmptyWrap = styled.div`
  display: grid;
  place-items: center;
  min-height: 330px;
`;
