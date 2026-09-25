import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Drawer,
  Dropdown,
  Empty,
  Input,
  List,
  message,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useAccess, CascadeAccess } from 'app/pages/MainPage/Access';
import {
  selectIsOrgOwner,
  selectOrgId,
} from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getInsertedNodeIndex, getPath } from 'utils/utils';
import { PermissionLevels, ResourceTypes } from '../PermissionPage/constants';
import { SaveFormContext } from './SaveFormContext';
import {
  selectArchived,
  selectArchivedListLoading,
  selectDeleteSourceLoading,
  selectSourceListLoading,
  selectSources,
} from './slice/selectors';
import {
  addSource,
  deleteSource,
  getArchivedSources,
  getSources,
  unarchiveSource,
  updateSourceBase,
} from './slice/thunks';
import { SourceSimpleViewModel } from './slice/types';

const { Text } = Typography;

type FilterType = 'ALL' | 'JDBC';

function parseConfig(source: SourceSimpleViewModel) {
  try {
    return JSON.parse(source.config || '{}') as Record<string, any>;
  } catch {
    return {};
  }
}

function sourceKind(source: SourceSimpleViewModel) {
  if (source.isFolder) return 'FOLDER';
  const config = parseConfig(source);
  return String(config.dbType || source.type || 'DATA').toUpperCase();
}

function sourceAddress(source: SourceSimpleViewModel) {
  if (source.isFolder) return '数据源文件夹';
  const config = parseConfig(source);
  const url = config.url || config.host || config.path || '';
  return typeof url === 'string' && url ? url : source.type;
}

export function LensSourceListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  const sources = useSelector(selectSources);
  const archived = useSelector(selectArchived);
  const loading = useSelector(selectSourceListLoading);
  const archivedLoading = useSelector(selectArchivedListLoading);
  const deleteLoading = useSelector(selectDeleteSourceLoading);
  const isOwner = useSelector(selectIsOrgOwner);
  const { showSaveForm } = useContext(SaveFormContext);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [recycleVisible, setRecycleVisible] = useState(false);

  const canCreate = useAccess({
    module: ResourceTypes.Source,
    level: PermissionLevels.Create,
  });

  useEffect(() => {
    if (orgId) dispatch(getSources(orgId));
  }, [dispatch, orgId]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return sources.filter(source => {
      const kind = sourceKind(source);
      const hitType = filter === 'ALL' || kind === filter;
      const hitKeyword = !q || `${source.name} ${kind} ${sourceAddress(source)}`.toLowerCase().includes(q);
      return hitType && hitKeyword;
    });
  }, [sources, keyword, filter]);

  const parentName = useCallback((parentId: string | null) => {
    if (!parentId) return '根目录';
    return sources.find(item => item.id === parentId)?.name || '根目录';
  }, [sources]);

  const pathOf = useCallback((source: SourceSimpleViewModel) =>
    getPath(
      sources as Array<{ id: string; parentId: string | null }>,
      { id: source.id, parentId: source.parentId || null },
      ResourceTypes.Source,
    ), [sources]);

  const openCreate = useCallback(() => {
    navigate(`/organizations/${orgId}/sources/new`);
  }, [navigate, orgId]);

  const createFolder = useCallback(() => {
    showSaveForm({
      sourceType: 'folder',
      type: CommonFormTypes.Add,
      visible: true,
      simple: false,
      parentIdLabel: '所属文件夹',
      onSave: (values, onClose) => {
        const index = getInsertedNodeIndex(values, sources);
        dispatch(addSource({
          source: {
            name: values.name,
            config: JSON.stringify(values.config || {}),
            parentId: values.parentId || null,
            index,
            orgId,
            isFolder: true,
          },
          resolve: () => {
            message.success('文件夹创建成功');
            onClose();
          },
        }));
      },
    });
  }, [dispatch, orgId, showSaveForm, sources]);

  const editFolder = useCallback((source: SourceSimpleViewModel) => {
    showSaveForm({
      sourceType: 'folder',
      type: CommonFormTypes.Edit,
      visible: true,
      simple: false,
      initialValues: { id: source.id, name: source.name, parentId: source.parentId },
      parentIdLabel: '所属文件夹',
      onSave: (values, onClose) => {
        const index = getInsertedNodeIndex(values, sources);
        dispatch(updateSourceBase({
          source: {
            id: source.id,
            name: values.name,
            parentId: values.parentId || null,
            index,
          },
          resolve: () => {
            message.success('文件夹已更新');
            onClose();
          },
        }));
      },
    });
  }, [dispatch, showSaveForm, sources]);

  const remove = useCallback((source: SourceSimpleViewModel) => {
    dispatch(deleteSource({
      id: source.id,
      archive: !source.isFolder,
      resolve: () => message.success(source.isFolder ? '文件夹已删除' : '数据源已移入回收站'),
    }));
  }, [dispatch]);

  const openRecycle = useCallback(() => {
    setRecycleVisible(true);
    dispatch(getArchivedSources(orgId));
  }, [dispatch, orgId]);

  const restore = useCallback((source: SourceSimpleViewModel) => {
    showSaveForm({
      sourceType: 'folder',
      type: CommonFormTypes.Edit,
      visible: true,
      simple: false,
      initialValues: { id: source.id, name: source.name, parentId: null },
      parentIdLabel: '恢复到',
      onSave: (values, onClose) => {
        const index = getInsertedNodeIndex(values, sources);
        dispatch(unarchiveSource({
          source: {
            id: source.id,
            name: values.name,
            parentId: values.parentId || null,
            index,
          },
          resolve: () => {
            message.success('数据源已恢复');
            onClose();
            dispatch(getSources(orgId));
            dispatch(getArchivedSources(orgId));
          },
        }));
      },
    });
  }, [dispatch, orgId, showSaveForm, sources]);

  const permanentlyDelete = useCallback((source: SourceSimpleViewModel) => {
    dispatch(deleteSource({
      id: source.id,
      archive: false,
      resolve: () => {
        message.success('已永久删除');
        dispatch(getArchivedSources(orgId));
      },
    }));
  }, [dispatch, orgId]);

  const createDataset = useCallback((source: SourceSimpleViewModel) => {
    navigate(`/organizations/${orgId}/datasets/new?sourceId=${source.id}`);
  }, [navigate, orgId]);

  return (
    <PageContainer
      title="数据源"
      subTitle="连接 MySQL 与 StarRocks，为数据集提供统一的数据访问入口"
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
          onClick={openCreate}
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
          <PlusOutlined /> 新建数据源
        </Dropdown.Button>,
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
          <Segmented
            value={filter}
            onChange={value => setFilter(value as FilterType)}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '数据库', value: 'JDBC' },
            ]}
          />
          <Input
            allowClear
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="搜索数据源名称或连接地址"
            style={{ width: 320 }}
          />
        </div>

        <Table<SourceSimpleViewModel>
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="暂无数据源" /> }}
          onRow={source => ({
            onDoubleClick: () => {
              if (!source.isFolder) {
                navigate(`/organizations/${orgId}/sources/${source.id}`);
              }
            },
          })}
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
              width: '28%',
              render: (_, source) => (
                <Space size={10}>
                  {source.isFolder ? (
                    <FolderOutlined style={{ color: '#d48806' }} />
                  ) : (
                    <DatabaseOutlined style={{ color: '#1677ff' }} />
                  )}
                  <Text strong>{source.name}</Text>
                </Space>
              ),
            },
            {
              title: '类型',
              key: 'type',
              width: 130,
              render: (_, source) => {
                const kind = sourceKind(source);
                return (
                  <Tag bordered={false} color={kind === 'STARROCKS' ? 'geekblue' : undefined}>
                    {kind === 'MYSQL'
                      ? 'MySQL'
                      : kind === 'STARROCKS'
                        ? 'StarRocks'
                        : source.isFolder
                          ? '文件夹'
                          : '数据库'}
                  </Tag>
                );
              },
            },
            {
              title: '连接地址',
              key: 'address',
              ellipsis: true,
              render: (_, source) => (
                <Text type="secondary" ellipsis>
                  {sourceAddress(source)}
                </Text>
              ),
            },
            {
              title: '位置',
              key: 'folder',
              width: 150,
              render: (_, source) => (
                <Text type="secondary">{parentName(source.parentId)}</Text>
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 250,
              align: 'right',
              render: (_, source) => {
                const managePath = pathOf(source);
                return (
                  <Space size={2}>
                    {!source.isFolder && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => createDataset(source)}
                      >
                        创建数据集
                      </Button>
                    )}
                    <CascadeAccess
                      module={ResourceTypes.Source}
                      path={managePath}
                      level={PermissionLevels.Manage}
                    >
                      <>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() =>
                            source.isFolder
                              ? editFolder(source)
                              : navigate(
                                  `/organizations/${orgId}/sources/${source.id}`,
                                )
                          }
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title={
                            source.isFolder
                              ? '确认删除该文件夹？'
                              : '确认将该数据源移入回收站？'
                          }
                          onConfirm={() => remove(source)}
                        >
                          <Button
                            type="link"
                            size="small"
                            danger
                            loading={deleteLoading}
                            icon={<DeleteOutlined />}
                          >
                            {source.isFolder ? '删除' : '归档'}
                          </Button>
                        </Popconfirm>
                      </>
                    </CascadeAccess>
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>

      <Drawer
        title="数据源回收站"
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
                avatar={
                  <DatabaseOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                }
                title={item.name}
                description={`${sourceKind(item)} · ${sourceAddress(item)}`}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </PageContainer>
  );

}
