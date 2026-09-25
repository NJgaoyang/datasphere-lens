import {
  ArrowLeftOutlined,
  CodeOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Flex, Space, Tag, Typography, theme } from 'antd';
import { useMemberSlice } from 'app/pages/MainPage/pages/MemberPage/slice';
import { useVariableSlice } from 'app/pages/MainPage/pages/VariablePage/slice';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMatch, useNavigate } from 'react-router-dom';
import { useSourceSlice } from '../SourcePage/slice';
import { getSources } from '../SourcePage/slice/thunks';
import { SaveForm } from './SaveForm';
import { Workbench } from './Main/Workbench';
import { selectCurrentEditingView } from './slice/selectors';
import { getViewDetail } from './slice/thunks';

const typeMeta = {
  STRUCT: { label: '表模型', icon: <TableOutlined /> },
  SQL: { label: 'SQL 数据集', icon: <CodeOutlined /> },
  VIEW_JOIN: { label: '关联数据集', icon: <NodeIndexOutlined /> },
};

const { Text, Title } = Typography;

export function LensDatasetStudio() {
  useSourceSlice();
  useMemberSlice();
  useVariableSlice();
  const dispatch = useDispatch();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  const datasetMatch = useMatch('/organizations/:orgId/datasets/:viewId');
  const legacyMatch = useMatch('/organizations/:orgId/views/:viewId');
  const viewId = datasetMatch?.params.viewId || legacyMatch?.params.viewId;
  const currentView = useSelector(selectCurrentEditingView);
  const meta = currentView?.type
    ? typeMeta[currentView.type as keyof typeof typeMeta]
    : undefined;

  useEffect(() => {
    if (orgId) dispatch(getSources(orgId));
  }, [dispatch, orgId]);

  useEffect(() => {
    if (viewId) dispatch(getViewDetail({ viewId }));
  }, [dispatch, viewId]);

  return (
    <Flex vertical style={{ width: '100%', height: '100%', minHeight: 0, background: token.colorBgLayout }}>
      <Flex align="center" justify="space-between" style={{ height: 52, flexShrink: 0, padding: '0 12px', background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Space size={12}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/organizations/${orgId}/datasets`)} />
          <Divider type="vertical" style={{ height: 28, margin: 0 }} />
          <div style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: token.borderRadiusLG, background: token.colorPrimaryBg, color: token.colorPrimary, fontSize: 17 }}>
            <DatabaseOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Space size={8} align="center">
              <Title level={5} ellipsis style={{ maxWidth: 440, margin: 0 }}>
                {currentView?.name || '新建数据集'}
              </Title>
              {currentView?.touched && <Tag color="warning">未保存</Tag>}
            </Space>
            <Space size={8} style={{ marginTop: 2 }}>
              {meta ? <Tag bordered={false} icon={meta.icon}>{meta.label}</Tag> : <Text type="secondary">选择数据集类型</Text>}
              <Text type="secondary">数据集工作台</Text>
            </Space>
          </div>
        </Space>
        <Text type="secondary">数据准备</Text>
      </Flex>
      <Card styles={{ body: { display: 'flex', flex: 1, minHeight: 0, padding: 0 } }} style={{ display: 'flex', flex: 1, minHeight: 0, margin: 8, overflow: 'hidden', borderColor: token.colorBorderSecondary, boxShadow: 'none' }}>
        <Workbench />
      </Card>
      <SaveForm formProps={{ labelAlign: 'left', labelCol: { offset: 1, span: 8 }, wrapperCol: { span: 13 } }} okText="保存" />
    </Flex>
  );
}
