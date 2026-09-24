import {
  ArrowLeftOutlined,
  DashboardOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
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
          <Kicker>DASHBOARD WORKBENCH</Kicker>
          <Title>{title || '未命名仪表板'}</Title>
        </TitleBlock>
      </Context>
      <Space>
        {children}
        <Button onClick={onCloseBoardEditor}>返回</Button>
        <Button
          type="primary"
          loading={saving}
          icon={<SaveOutlined />}
          onClick={onUpdateBoard}
        >
          保存仪表板
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
  min-height: 62px;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #e7eaf0;
`;

const Context = styled.div`
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

const Mark = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 16px;
  color: #7c3aed;
  background: #f5f3ff;
  border-radius: 10px;
`;

const TitleBlock = styled.div`
  min-width: 0;

  &.disabled ${'' /* status hint is represented by muted title */} {
    opacity: 0.7;
  }
`;

const Kicker = styled.div`
  margin-bottom: 2px;
  font-size: 9px;
  font-weight: 700;
  color: #667085;
  letter-spacing: 0.12em;
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
