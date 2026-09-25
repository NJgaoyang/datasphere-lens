import {
  ArrowLeftOutlined,
  DashboardOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Space, Tag } from 'antd';
import classnames from 'classnames';
import { FC, memo, PropsWithChildren, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useStatusTitle } from '../../hooks/useStatusTitle';
import { clearEditBoardState } from '../../pages/BoardEditor/slice/actions/actions';
import { BoardActionContext } from '../ActionProvider/BoardActionProvider';
import { WidgetActionContext } from '../ActionProvider/WidgetActionProvider';
import { BoardInfoContext } from '../BoardProvider/BoardInfoProvider';
import { BoardContext } from '../BoardProvider/BoardProvider';

const EditorHeader: FC<PropsWithChildren> = memo(({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateBoard } = useContext(BoardActionContext);
  const { onEditClearActiveWidgets } = useContext(WidgetActionContext);
  const { name, status } = useContext(BoardContext);
  const { saving } = useContext(BoardInfoContext);
  const title = useStatusTitle(name, status);

  const onCloseBoardEditor = () => {
    const pathName = location.pathname;
    const prePath = pathName.split('/boardEditor')[0];
    navigate(prePath);
    dispatch(clearEditBoardState());
  };

  const onUpdateBoard = () => {
    onEditClearActiveWidgets();
    setImmediate(() => updateBoard?.(onCloseBoardEditor));
  };

  return (
    <Wrapper onClick={onEditClearActiveWidgets}>
      <Context>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onCloseBoardEditor}
        />
        <Divider />
        <Mark><DashboardOutlined /></Mark>
        <TitleBlock className={classnames({ disabled: status < 2 })}>
          <Title>{title || '未命名仪表板'}</Title>
        </TitleBlock>
        <Tag bordered={false} color={status >= 2 ? 'success' : undefined}>
          {status >= 2 ? '已发布' : '草稿'}
        </Tag>
      </Context>
      <Space>
        {children}
        <Button
          type="primary"
          size="small"
          loading={saving}
          icon={<SaveOutlined />}
          onClick={onUpdateBoard}
        >
          保存
        </Button>
      </Space>
    </Wrapper>
  );
});

export default EditorHeader;

const Wrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #e7eaf0;
`;

const Context = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
`;

const Divider = styled.div`
  width: 1px;
  height: 22px;
  background: #eaecf0;
`;

const Mark = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  font-size: 14px;
  color: #7c3aed;
  background: #f5f3ff;
  border-radius: 6px;
`;

const TitleBlock = styled.div`
  min-width: 0;

  &.disabled ${'' /* status hint is represented by muted title */} {
    opacity: 0.7;
  }
`;



const Title = styled.div`
  max-width: 420px;
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  color: #182230;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
