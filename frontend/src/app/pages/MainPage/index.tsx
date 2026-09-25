/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Spin } from 'antd';
import ChartEditor, { ChartEditorBaseProps } from 'app/components/ChartEditor';
import useMount from 'app/hooks/useMount';
import { useIsMobile } from 'app/hooks/useIsMobile';
import { useIsWeappEmbed } from 'app/hooks/useEmbedMode';
import ChartManager from 'app/models/ChartManager';
import { useAppSlice } from 'app/slice';
import { selectLoggedInUser } from 'app/slice/selectors';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import styled from 'styled-components';
import { NotFoundPage } from '../NotFoundPage';
import { StoryEditor } from '../StoryBoardPage/Editor';
import { StoryPlayer } from '../StoryBoardPage/Player';
import { AccessRoute } from './AccessRoute';
import { AuditLogPage } from './pages/AuditLogPage';
import { LensHomePage } from './pages/LensHomePage';
import { ConfirmInvitePage } from './pages/ConfirmInvitePage';
import { MemberPage } from './pages/MemberPage';
import { MonitorPage } from './pages/MonitorPage';
import { OrgSettingPage } from './pages/OrgSettingPage';
import { PermissionPage } from './pages/PermissionPage';
import { ResourceTypes } from './pages/PermissionPage/constants';
import { ResourceMigrationPage } from './pages/ResourceMigrationPage';
import { ReadinessPage } from './pages/ReadinessPage';
import { SchedulePage } from './pages/SchedulePage';
import { SourcePage } from './pages/SourcePage';
import { VariablePage } from './pages/VariablePage';
import { ViewPage } from './pages/ViewPage';
import { useViewSlice } from './pages/ViewPage/slice';
import { MobileVizPage } from './MobileVizPage';
import { VizPage } from './pages/VizPage';
import { useVizSlice } from './pages/VizPage/slice';
import { initChartPreviewData } from './pages/VizPage/slice/thunks';
import { UNPERSISTED_ID_PREFIX } from './pages/ViewPage/constants';
import { uuidv4 } from 'utils/utils';
import { LensLayout } from './LensLayout';
import { ProductErrorBoundary } from './ProductErrorBoundary';
import { useMainSlice } from './slice';
import { selectOrgId } from './slice/selectors';
import {
  getDataProviders,
  getLoggedInUserPermissions,
  getUserSettings,
} from './slice/thunks';
function DatasetCreateRoute({ orgId }: { orgId: string }) {
  const location = useLocation();
  const newViewId = useMemo(
    () => `${UNPERSISTED_ID_PREFIX}${uuidv4()}`,
    [],
  );
  const params = new URLSearchParams(location.search);
  const sourceId = params.get('sourceId');
  const parentId = params.get('parentId');
  const state = {
    ...(sourceId ? { sourcesId: sourceId } : {}),
    ...(parentId ? { parentId } : {}),
  };

  return (
    <Navigate
      to={`/organizations/${orgId}/datasets/${newViewId}`}
      replace
      state={Object.keys(state).length ? state : undefined}
    />
  );
}

function ChartEditorRoute({
  orgId,
  onClose,
  onSaveInDataChart,
}: {
  orgId: string;
  onClose: () => void;
  onSaveInDataChart: (orgId: string, backendChartId: string) => void;
}) {
  const location = useLocation();
  const hisSearch = new URLSearchParams(location.search);
  const hisState = {
    dataChartId: hisSearch.get('dataChartId') || '',
    chartType: hisSearch.get('chartType') || 'dataChart',
    container: hisSearch.get('container') || 'dataChart',
    defaultViewId: hisSearch.get('defaultViewId') || '',
  } as ChartEditorBaseProps;
  return (
    <AccessRoute module={ResourceTypes.Viz}>
      <ChartEditor
        dataChartId={hisState.dataChartId}
        orgId={orgId}
        chartType={hisState.chartType}
        container={hisState.container}
        defaultViewId={hisState.defaultViewId}
        onClose={onClose}
        onSaveInDataChart={onSaveInDataChart}
      />
    </AccessRoute>
  );
}

export function MainPage() {
  useAppSlice();
  const { actions } = useMainSlice();
  const { actions: vizActions } = useVizSlice();
  const { actions: viewActions } = useViewSlice();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const isWeappEmbed = useIsWeappEmbed();
  const shouldUseMobileViz = isMobile || isWeappEmbed;
  const organizationMatch = useMatch('/organizations/:orgId/*');
  const orgId = useSelector(selectOrgId);
  const navigate = useNavigate();
  const location = useLocation();
  const useLensShell =
    !shouldUseMobileViz &&
    !location.pathname.includes('/storyEditor/') &&
    !location.pathname.includes('/storyPlayer/') &&
    !location.pathname.includes('/charts/new') &&
    !location.pathname.includes('/chartEditor') &&
    !location.pathname.includes('/boardEditor');
  // loaded first time

  useMount(
    () => {
      ChartManager.instance()
        .load()
        .catch(err =>
          console.error('Fail to load customize charts with ', err),
        );
      dispatch(getUserSettings(organizationMatch?.params.orgId));
      dispatch(getDataProviders());
    },
    () => {
      dispatch(actions.clear());
    },
  );

  const loggedInUser = useSelector(selectLoggedInUser);

  useEffect(() => {
    if (orgId && loggedInUser?.id) {
      dispatch(vizActions.clear());
      dispatch(viewActions.clear());
      dispatch(getLoggedInUserPermissions(orgId));
    }
  }, [dispatch, vizActions, viewActions, orgId, loggedInUser?.id]);

  const onSaveInDataChart = useCallback(
    (orgId: string, backendChartId: string) => {
      dispatch(
        initChartPreviewData({
          backendChartId,
          orgId,
        }),
      );
      navigate(`/organizations/${orgId}/charts/${backendChartId}`);
    },
    [dispatch, navigate],
  );

  if (!orgId) {
    return (
      <LoadingContainer>
        <Spin size="large" />
        <span>正在加载工作空间...</span>
      </LoadingContainer>
    );
  }

  const routeContent = (
    <Routes>
          <Route
            path="/"
            element={<Navigate to={`/organizations/${orgId}`} replace />}
          />
          <Route path="/confirminvite" element={<ConfirmInvitePage />} />
          <Route path="/organizations/:orgId/home" element={<LensHomePage orgId={orgId} />} />
          <Route
            path="/organizations/:orgId"
            element={
              <Navigate
                to={`/organizations/${organizationMatch?.params.orgId}/home`}
                replace
              />
            }
          />
          <Route
            path="/organizations/:orgId/vizs/chartEditor"
            element={
              <ChartEditorRoute
                orgId={orgId}
                onClose={() => navigate(-1)}
                onSaveInDataChart={onSaveInDataChart}
              />
            }
          />
          <Route
            path="/organizations/:orgId/datasets/new"
            element={<DatasetCreateRoute orgId={orgId} />}
          />
          <Route
            path="/organizations/:orgId/dashboards/new"
            element={
              <Navigate
                to={`/organizations/${orgId}/dashboards?create=dashboard`}
                replace
              />
            }
          />
          <Route
            path="/organizations/:orgId/charts/new"
            element={
              <ChartEditorRoute
                orgId={orgId}
                onClose={() => navigate(`/organizations/${orgId}/charts`)}
                onSaveInDataChart={onSaveInDataChart}
              />
            }
          />
          <Route
            path="/organizations/:orgId/charts/*"
            element={
              <AccessRoute module={ResourceTypes.Viz}>
                <VizPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/dashboards/*"
            element={
              <AccessRoute module={ResourceTypes.Viz}>
                <VizPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/vizs/storyPlayer/:storyId"
            element={<StoryPlayer />}
          />
          <Route
            path="/organizations/:orgId/vizs/storyEditor/:storyId"
            element={<StoryEditor />}
          />
          <Route
            path="/organizations/:orgId/vizs/*"
            element={
              shouldUseMobileViz ? (
                <MobileVizPage />
              ) : (
                <AccessRoute module={ResourceTypes.Viz}>
                  <VizPage />
                </AccessRoute>
              )
            }
          />
          <Route
            path="/organizations/:orgId/datasets/*"
            element={
              <AccessRoute module={ResourceTypes.View}>
                <ViewPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/views/*"
            element={
              <AccessRoute module={ResourceTypes.View}>
                <ViewPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/sources/*"
            element={
              <AccessRoute module={ResourceTypes.Source}>
                <SourcePage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/schedules/*"
            element={
              <AccessRoute module={ResourceTypes.Schedule}>
                <SchedulePage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/members/*"
            element={
              <AccessRoute module={ResourceTypes.User}>
                <MemberPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/roles/*"
            element={
              <AccessRoute module={ResourceTypes.User}>
                <MemberPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/permissions"
            element={
              <Navigate
                to={`/organizations/${organizationMatch?.params.orgId}/permissions/subject`}
                replace
              />
            }
          />
          <Route
            path="/organizations/:orgId/permissions/:viewpoint/*"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <PermissionPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/variables"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <VariablePage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/monitor"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <MonitorPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/orgSettings"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <OrgSettingPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/resourceMigration"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <ResourceMigrationPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/readiness"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <ReadinessPage />
              </AccessRoute>
            }
          />
          <Route
            path="/organizations/:orgId/auditLog"
            element={
              <AccessRoute module={ResourceTypes.Manager}>
                <AuditLogPage />
              </AccessRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
  );

  const guardedRouteContent = (
    <ProductErrorBoundary
      key={location.pathname}
      homePath={`/organizations/${orgId}/home`}
    >
      {routeContent}
    </ProductErrorBoundary>
  );

  return useLensShell ? (
    <LensLayout orgId={orgId}>{guardedRouteContent}</LensLayout>
  ) : (
    <AppContainer>{guardedRouteContent}</AppContainer>
  );
}

const AppContainer = styled.main`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  background-color: ${p => p.theme.bodyBackground};
`;


const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  color: ${p => p.theme.textColorSnd};
  background: ${p => p.theme.bodyBackground};
`;
