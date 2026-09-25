import { Split } from 'app/components';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { useSplitSizes } from 'app/hooks/useSplitSizes';
import { dispatchResize } from 'app/utils/dispatchResize';
import { useCallback, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectOrgId } from '../../slice/selectors';
import { useVizSlice } from '../VizPage/slice';
import { EditorPage } from './EditorPage';
import { SaveForm } from './SaveForm';
import { SaveFormContext, useSaveFormContext } from './SaveFormContext';
import { Sidebar } from './Sidebar';
import { useScheduleSlice } from './slice';

export function SchedulePage() {
  const tg = useI18NPrefix('global');
  const saveFormContextValue = useSaveFormContext();
  const navigate = useNavigate();
  const orgId = useSelector(selectOrgId);
  useScheduleSlice();
  useVizSlice();
  const editorMatch = useMatch(
    '/organizations/:orgId/schedules/:scheduleId',
  );

  const [sliderVisible, setSliderVisible] = useState<boolean>(false);

  const { sizes, setSizes } = useSplitSizes({
    limitedSide: 0,
    range: [256, 768],
  });

  const [isDragging, setIsDragging] = useState(false);

  const siderDragEnd = useCallback(
    sizes => {
      setSizes(sizes);
      dispatchResize();
      setIsDragging(false);
    },
    [setSizes, setIsDragging],
  );

  const siderDragStart = useCallback(() => {
    if (!isDragging) setIsDragging(true);
  }, [setIsDragging, isDragging]);

  const handleSliderVisible = useCallback(
    (status: boolean) => {
      setSliderVisible(status);
      setTimeout(() => {
        dispatchResize();
      }, 300);
    },
    [setSliderVisible],
  );

  return (
    <SaveFormContext.Provider value={saveFormContextValue}>
      <Container
        sizes={sizes}
        minSize={[256, 0]}
        maxSize={[768, Infinity]}
        gutterSize={0}
        onDragStart={siderDragStart}
        onDragEnd={siderDragEnd}
        className="datart-split"
        sliderVisible={sliderVisible}
      >
        <Sidebar
          width={sizes[0]}
          isDragging={isDragging}
          sliderVisible={sliderVisible}
          handleSliderVisible={handleSliderVisible}
        />
        <EditorPageWrapper className={sliderVisible ? 'close' : ''}>
          {editorMatch ? (
            <EditorPage />
          ) : (
            <EmptyState>
              <Empty
                image={<CalendarOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                description="选择左侧定时任务查看详情，或创建一个新的任务"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    navigate(`/organizations/${orgId}/schedules/add`)
                  }
                >
                  新建定时任务
                </Button>
              </Empty>
            </EmptyState>
          )}
        </EditorPageWrapper>
        <SaveForm
          formProps={{
            labelAlign: 'left',
            labelCol: { offset: 1, span: 8 },
            wrapperCol: { span: 13 },
          }}
          okText={tg('button.save')}
        />
      </Container>
    </SaveFormContext.Provider>
  );
}

const Container = styled(Split)<{ sliderVisible: boolean }>`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  .gutter-horizontal {
    display: ${p => (p.sliderVisible ? 'none' : 'block')};
  }
`;

const EditorPageWrapper = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  &.close {
    width: calc(100% - 30px) !important;
    min-width: calc(100% - 30px) !important;
    padding-left: 30px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  background: ${p => p.theme.bodyBackground};
`;
