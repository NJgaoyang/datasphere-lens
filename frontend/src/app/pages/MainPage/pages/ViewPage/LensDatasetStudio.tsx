import {
  ArrowLeftOutlined,
  CodeOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { useMemberSlice } from 'app/pages/MainPage/pages/MemberPage/slice';
import { useVariableSlice } from 'app/pages/MainPage/pages/VariablePage/slice';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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

export function LensDatasetStudio() {
  useSourceSlice();
  useMemberSlice();
  useVariableSlice();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  const match = useMatch('/organizations/:orgId/views/:viewId');
  const viewId = match?.params.viewId;
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
    <Studio>
      <StudioHeader>
        <HeaderLeft>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/organizations/${orgId}/views`)}
          />
          <Divider />
          <DatasetMark>
            <DatabaseOutlined />
          </DatasetMark>
          <DatasetContext>
            <TitleRow>
              <strong>{currentView?.name || '新建数据集'}</strong>
              {currentView?.touched && <Changed>未保存</Changed>}
            </TitleRow>
            <MetaRow>
              {meta ? (
                <Tag bordered={false} icon={meta.icon}>{meta.label}</Tag>
              ) : (
                <span>选择数据集类型</span>
              )}
              <span>数据集工作台</span>
            </MetaRow>
          </DatasetContext>
        </HeaderLeft>
        <Button onClick={() => navigate(`/organizations/${orgId}/views`)}>
          返回数据集
        </Button>
      </StudioHeader>
      <EditorSurface>
        <Workbench />
      </EditorSurface>
      <SaveForm
        formProps={{
          labelAlign: 'left',
          labelCol: { offset: 1, span: 8 },
          wrapperCol: { span: 13 },
        }}
        okText="保存"
      />
    </Studio>
  );
}

const Studio = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  background: #eef1f5;
`;

const StudioHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #e7eaf0;
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
`;
const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: #eaecf0;
`;

const DatasetMark = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 17px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 10px;
`;

const DatasetContext = styled.div`
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;

  strong {
    max-width: 440px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 650;
    color: #182230;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Changed = styled.span`
  padding: 2px 6px;
  font-size: 10px;
  color: #b54708;
  background: #fffaeb;
  border-radius: 10px;
`;
const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 3px;
  font-size: 10px;
  color: #98a2b3;

  .ant-tag {
    margin: 0;
    font-size: 10px;
    line-height: 18px;
  }
`;

const EditorSurface = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  margin: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.04);
`;
