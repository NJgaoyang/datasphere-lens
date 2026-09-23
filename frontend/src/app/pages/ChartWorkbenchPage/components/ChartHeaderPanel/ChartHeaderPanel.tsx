import {
  ArrowLeftOutlined,
  DashboardOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import SaveToDashboard from 'app/components/SaveToDashboard';
import useMount from 'app/hooks/useMount';
import { useWorkbenchSlice } from 'app/pages/ChartWorkbenchPage/slice';
import { DownloadListPopup } from 'app/pages/MainPage/Navbar/DownloadListPopup';
import { loadTasks } from 'app/pages/MainPage/Navbar/service';
import { selectHasVizFetched } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import { getFolders } from 'app/pages/MainPage/pages/VizPage/slice/thunks';
import { downloadFile } from 'app/utils/fetch';
import { FC, memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  backendChartSelector,
  selectChartEditorDownloadPolling,
} from '../../slice/selectors';

const ChartHeaderPanel: FC<{
  chartName?: string;
  orgId?: string;
  container?: string;
  onSaveChart?: () => void;
  onGoBack?: () => void;
  onSaveChartToDashBoard?: (dashboardId, dashboardType) => void;
}> = memo(
  ({
    chartName,
    orgId,
    container,
    onSaveChart,
    onGoBack,
    onSaveChartToDashBoard,
  }) => {
    const hasVizFetched = useSelector(selectHasVizFetched);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const backendChart = useSelector(backendChartSelector);
    const downloadPolling = useSelector(selectChartEditorDownloadPolling);
    const dispatch = useDispatch();
    const { actions } = useWorkbenchSlice();

    const handleModalOk = useCallback(
      (dashboardId: string, dashboardType: string) => {
        onSaveChartToDashBoard?.(dashboardId, dashboardType);
        setIsModalVisible(false);
      },
      [onSaveChartToDashBoard],
    );

    const onSetPolling = useCallback(
      (polling: boolean) => {
        dispatch(actions.setChartEditorDownloadPolling(polling));
      },
      [actions, dispatch],
    );

    useMount(() => {
      if (!hasVizFetched && orgId) {
        dispatch(getFolders(orgId));
      }
    });

    return (
      <Wrapper>
        <Context>
          <BackButton
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onGoBack}
          />
          <Divider />
          <TitleBlock>
            <Kicker>CHART WORKBENCH</Kicker>
            <Title>{chartName || '未命名图表'}</Title>
          </TitleBlock>
        </Context>

        <Actions>
          <DownloadListPopup
            polling={downloadPolling}
            setPolling={onSetPolling}
            onLoadTasks={loadTasks}
            onDownloadFile={item => {
              if (item.id) {
                downloadFile(item.id).then(() => {
                  dispatch(actions.setChartEditorDownloadPolling(true));
                });
              }
            }}
            renderDom={<Button icon={<DownloadOutlined />}>下载</Button>}
          />
          <Button icon={<SaveOutlined />} type="primary" onClick={onSaveChart}>
            保存
          </Button>
          {container !== 'widget' && (
            <Button
              icon={<DashboardOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              添加到仪表板
            </Button>
          )}
        </Actions>

        <SaveToDashboard
          orgId={orgId as string}
          title="添加到仪表板"
          isModalVisible={isModalVisible}
          backendChartId={backendChart?.id}
          handleOk={handleModalOk}
          handleCancel={() => setIsModalVisible(false)}
          handleOpen={() => setIsModalVisible(true)}
        />
      </Wrapper>
    );
  },
);

export default ChartHeaderPanel;

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

const BackButton = styled(Button)`
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: #eaecf0;
`;

const TitleBlock = styled.div`
  min-width: 0;
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

const Actions = styled(Space)`
  flex-shrink: 0;
`;
