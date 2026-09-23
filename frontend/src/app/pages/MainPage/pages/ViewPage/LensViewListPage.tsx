import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Drawer,
  Dropdown,
  Empty,
  Input,
  List,
  message,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd';
import { CascadeAccess, useAccess } from 'app/pages/MainPage/Access';
import {
  selectIsOrgOwner,
  selectOrgId,
} from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getInsertedNodeIndex, getPath, uuidv4 } from 'utils/utils';
import { PermissionLevels, ResourceTypes } from '../PermissionPage/constants';
import {
  selectSources,
} from '../SourcePage/slice/selectors';
import { getSources } from '../SourcePage/slice/thunks';
import { UNPERSISTED_ID_PREFIX } from './constants';
import { SaveFormContext } from './SaveFormContext';
import {
  selectArchived,
  selectArchivedListLoading,
  selectViewListLoading,
  selectViews,
} from './slice/selectors';
import {
  deleteView,
  getArchivedViews,
  getViews,
  saveFolder,
  unarchiveView,
  updateViewBase,
} from './slice/thunks';
import { ViewSimpleViewModel } from './slice/types';

const { Text } = Typography;

type FilterType = 'ALL' | 'DATASET' | 'FOLDER';

export function LensViewListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  const views = useSelector(selectViews) || [];
  const archived = useSelector(selectArchived) || [];
  const sources = useSelector(selectSources);
  const loading = useSelector(selectViewListLoading);
  const archivedLoading = useSelector(selectArchivedListLoading);
  const isOwner = useSelector(selectIsOrgOwner);
  const { showSaveForm } = useContext(SaveFormContext);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [recycleVisible, setRecycleVisible] = useState(false);

  const canCreate = useAccess({
    module: ResourceTypes.View,
    level: PermissionLevels.Create,
  });

  useEffect(() => {
    if (!orgId) return;
    dispatch(getViews(orgId));
    dispatch(getSources(orgId));
  }, [dispatch, orgId]);

  const datasets = useMemo(() => views.filter(v => !v.isFolder), [views]);
  const folders = useMemo(() => views.filter(v => v.isFolder), [views]);
  const usedSourceCount = useMemo(
    () => new Set(datasets.map(v => v.sourceId).filter(Boolean)).size,
    [datasets],
  );

  const sourceName = useCallback(
    (sourceId: string) =>
      sources.find(source => source.id === sourceId)?.name || '未绑定数据源',
    [sources],
  );

  const folderName = useCallback(
    (parentId: string | null) =>
      parentId ? views.find(v => v.id === parentId)?.name || '根目录' : '根目录',
    [views],
  );

  const folderTrail = useMemo(() => {
    const trail: ViewSimpleViewModel[] = [];
    const seen = new Set<string>();
    let currentId = folderId;
    while (currentId && !seen.has(currentId)) {
      seen.add(currentId);
      const current = views.find(v => v.id === currentId && v.isFolder);
      if (!current) break;
      trail.unshift(current);
      currentId = current.parentId;
    }
    return trail;
  }, [folderId, views]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return views
      .filter(item => item.parentId === folderId)
      .filter(item => {
        const hitType =
          filter === 'ALL' ||
          (filter === 'FOLDER' && item.isFolder) ||
          (filter === 'DATASET' && !item.isFolder);
        const source = item.isFolder ? '' : sourceName(item.sourceId);
        const hitKeyword =
          !q ||
          `${item.name} ${item.description || ''} ${source}`
            .toLowerCase()
            .includes(q);
        return hitType && hitKeyword;
      })
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name, 'zh-CN');
      });
  }, [filter, folderId, keyword, sourceName, views]);

  const pathOf = useCallback(
    (view: ViewSimpleViewModel) =>
      getPath(
        views as Array<{ id: string; parentId: string | null }>,
        { id: view.id, parentId: view.parentId || null },
        ResourceTypes.View,
      ),
    [views],
  );

  const createDataset = useCallback(() => {
    navigate(
      `/organizations/${orgId}/views/${`${UNPERSISTED_ID_PREFIX}${uuidv4()}`}`,
      { state: { parentId: folderId } },
    );
  }, [folderId, navigate, orgId]);

  const createFolder = useCallback(() => {
    showSaveForm({
      type: CommonFormTypes.Add,
      visible: true,
      simple: true,
      initialValues: { name: '', parentId: folderId, config: {} },
      parentIdLabel: '所属文件夹',
      onSave: (values, onClose) => {
        const parentId = values.parentId || null;
        const index = getInsertedNodeIndex({ ...values, parentId }, views);
        dispatch(
          saveFolder({
            folder: {
              ...values,
              parentId,
              index,
            } as any,
            resolve: () => {
              message.success('文件夹创建成功');
              onClose();
            },
          }),
        );
      },
    });
  }, [dispatch, folderId, showSaveForm, views]);

  const editFolder = useCallback(
    (view: ViewSimpleViewModel) => {
      showSaveForm({
        type: CommonFormTypes.Edit,
        visible: true,
        simple: true,
        initialValues: {
          id: view.id,
          name: view.name,
          parentId: view.parentId,
          config: {},
        },
        parentIdLabel: '所属文件夹',
        onSave: (values, onClose) => {
          const parentId = values.parentId || null;
          const index = getInsertedNodeIndex({ ...values, parentId }, views);
          dispatch(
            updateViewBase({
              view: {
                id: view.id,
                name: values.name,
                parentId,
                index,
              },
              resolve: () => {
                message.success('文件夹已更新');
                onClose();
              },
            }),
          );
        },
      });
    },
    [dispatch, showSaveForm, views],
  );

  const remove = useCallback(
    (view: ViewSimpleViewModel) => {
      dispatch(
        deleteView({
          id: view.id,
          archive: !view.isFolder,
          resolve: () => {
            message.success(view.isFolder ? '文件夹已删除' : '数据集已移入回收站');
            if (folderId === view.id) setFolderId(view.parentId || null);
          },
        }),
      );
    },
    [dispatch, folderId],
  );

  const openRecycle = useCallback(() => {
    setRecycleVisible(true);
    dispatch(getArchivedViews(orgId));
  }, [dispatch, orgId]);

  const restore = useCallback(
    (view: ViewSimpleViewModel) => {
      showSaveForm({
        type: CommonFormTypes.Edit,
        visible: true,
        simple: true,
        initialValues: {
          id: view.id,
          name: view.name,
          parentId: null,
          config: {},
        },
        parentIdLabel: '恢复到',
        onSave: (values, onClose) => {
          const parentId = values.parentId || null;
          const index = getInsertedNodeIndex({ ...values, parentId }, views);
          dispatch(
            unarchiveView({
              view: {
                id: view.id,
                name: values.name,
                parentId,
                index,
              },
              resolve: () => {
                message.success('数据集已恢复');
                onClose();
                dispatch(getViews(orgId));
                dispatch(getArchivedViews(orgId));
              },
            }),
          );
        },
      });
    },
    [dispatch, orgId, showSaveForm, views],
  );

  const permanentlyDelete = useCallback(
    (view: ViewSimpleViewModel) => {
      dispatch(
        deleteView({
          id: view.id,
          archive: false,
          resolve: () => {
            message.success('已永久删除');
            dispatch(getArchivedViews(orgId));
          },
        }),
      );
    },
    [dispatch, orgId],
  );

  return (
    <PageContainer
      title="数据集"
      subTitle="统一管理表模型、SQL 数据集与关联模型"
      style={{ flex: 1, overflow: 'auto' }}
      extra={[
        <Button key="recycle" onClick={openRecycle}>
          回收站
        </Button>,
        <Dropdown.Button
          key="create"
          type="primary"
          icon={<FolderAddOutlined />}
          disabled={!canCreate({})}
          onClick={createDataset}
          menu={{
            items: [
              {
                key: 'folder',
                label: '新建文件夹',
                icon: <FolderAddOutlined />,
              },
            ],
            onClick: createFolder,
          }}
        >
          <PlusOutlined /> 新建数据集
        </Dropdown.Button>,
      ]}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Text type="secondary">数据集</Text>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
              {datasets.length}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Text type="secondary">已使用数据源</Text>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
              {usedSourceCount}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Text type="secondary">文件夹</Text>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
              {folders.length}
            </div>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 12,
          }}
        >
          <Breadcrumb
            items={[
              {
                title: (
                  <Button type="link" size="small" onClick={() => setFolderId(null)}>
                    根目录
                  </Button>
                ),
              },
              ...folderTrail.map(folder => ({
                title: (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setFolderId(folder.id)}
                  >
                    {folder.name}
                  </Button>
                ),
              })),
            ]}
          />
          <Input
            allowClear
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="搜索当前目录的数据集"
            style={{ width: 340 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Segmented
            value={filter}
            onChange={value => setFilter(value as FilterType)}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '数据集', value: 'DATASET' },
              { label: '文件夹', value: 'FOLDER' },
            ]}
          />
        </div>

        <List
          loading={loading}
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3, xl: 4 }}
          dataSource={filtered}
          locale={{ emptyText: <Empty description="当前目录暂无数据集" /> }}
          renderItem={view => {
            const managePath = pathOf(view);
            const source = view.isFolder ? '' : sourceName(view.sourceId);
            return (
              <List.Item>
                <Card
                  hoverable
                  styles={{ body: { padding: 16 } }}
                  onClick={() =>
                    view.isFolder
                      ? setFolderId(view.id)
                      : navigate(`/organizations/${orgId}/views/${view.id}`)
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        background: view.isFolder ? '#fff7e6' : '#eaf3ff',
                        color: view.isFolder ? '#d48806' : '#1677ff',
                        fontSize: 20,
                        flex: 'none',
                      }}
                    >
                      {view.isFolder ? <FolderOutlined /> : <TableOutlined />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {view.name}
                      </div>
                      <Space size={6} style={{ marginTop: 6 }} wrap>
                        <Tag bordered={false}>{view.isFolder ? '文件夹' : '数据集'}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {folderName(view.parentId)}
                        </Text>
                      </Space>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      minHeight: 34,
                      color: '#86909c',
                      fontSize: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {view.isFolder
                      ? '数据集文件夹'
                      : view.description || `数据源：${source}`}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 4,
                      borderTop: '1px solid #f2f3f5',
                      marginTop: 12,
                      paddingTop: 10,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {!view.isFolder && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => navigate(`/organizations/${orgId}/views/${view.id}`)}
                      >
                        打开编辑器
                      </Button>
                    )}
                    <CascadeAccess
                      module={ResourceTypes.View}
                      path={managePath}
                      level={PermissionLevels.Manage}
                    >
                      <>
                        <Button
                          type="link"
                          size="small"
                          icon={view.isFolder ? <FolderOpenOutlined /> : <EditOutlined />}
                          onClick={() =>
                            view.isFolder
                              ? editFolder(view)
                              : navigate(`/organizations/${orgId}/views/${view.id}`)
                          }
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title={
                            view.isFolder
                              ? '确认删除该文件夹？'
                              : '确认将该数据集移入回收站？'
                          }
                          onConfirm={() => remove(view)}
                        >
                          <Button
                            type="link"
                            size="small"
                            danger
                            loading={view.deleteLoading}
                            icon={<DeleteOutlined />}
                          >
                            {view.isFolder ? '删除' : '归档'}
                          </Button>
                        </Popconfirm>
                      </>
                    </CascadeAccess>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      </Card>

      <Drawer
        title="数据集回收站"
        width={620}
        open={recycleVisible}
        onClose={() => setRecycleVisible(false)}
      >
        <List
          loading={archivedLoading}
          dataSource={archived}
          locale={{ emptyText: <Empty description="回收站为空" /> }}
          renderItem={item => (
            <List.Item
              actions={
                isOwner
                  ? [
                      <Button
                        key="restore"
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={() => restore(item)}
                      >
                        恢复
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="永久删除后无法恢复，确认删除？"
                        onConfirm={() => permanentlyDelete(item)}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          永久删除
                        </Button>
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                avatar={<DatabaseOutlined style={{ fontSize: 20, color: '#1677ff' }} />}
                title={item.name}
                description={item.description || `数据源：${sourceName(item.sourceId)}`}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </PageContainer>
  );
}
