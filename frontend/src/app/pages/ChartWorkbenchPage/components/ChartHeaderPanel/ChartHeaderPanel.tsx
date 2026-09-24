import {
  ArrowLeftOutlined,
  DashboardOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Divider, Flex, Space, Typography, theme } from 'antd';
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
    const { token } = theme.useToken();

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
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        style={{
          minHeight: 62,
          padding: '0 18px',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex align="center" gap={10} style={{ minWidth: 0 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onGoBack}
          />
          <Divider type="vertical" style={{ height: 28, marginInline: 0 }} />
          <div style={{ minWidth: 0 }}>
            <Typography.Text
              type="secondary"
              style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}
            >
              CHART WORKBENCH
            </Typography.Text>
            <Typography.Text
              ellipsis={{ tooltip: chartName || '未命名图表' }}
              strong
              style={{ display: 'block', maxWidth: 420, fontSize: 14 }}
            >
              {chartName || '未命名图表'}
            </Typography.Text>
          </div>
        </Flex>

        <Space wrap>
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
        </Space>

        <SaveToDashboard
          orgId={orgId as string}
          title="添加到仪表板"
          isModalVisible={isModalVisible}
          backendChartId={backendChart?.id}
          handleOk={handleModalOk}
          handleCancel={() => setIsModalVisible(false)}
          handleOpen={() => setIsModalVisible(true)}
        />
      </Flex>
    );
  },
);

export default ChartHeaderPanel;

