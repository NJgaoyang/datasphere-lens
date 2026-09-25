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

import {
  ApartmentOutlined,
  DatabaseOutlined,
  FunctionOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { PaneWrapper } from 'app/components';
import { Segmented } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { EditorContext } from '../../EditorContext';
import ViewErrorBoundary from '../../ErrorBoundary';
import { ColumnPermissions } from './ColumnPermissions';
import DataModelTree from './DataModelTree/DataModelTree';
import { Resource } from './Resource';
import { Variables } from './Variables';

interface PropertiesProps {
  allowManage: boolean;
  viewType: string;
}

export const Properties = memo(({ allowManage, viewType }: PropertiesProps) => {
  const [selectedTab, setSelectedTab] = useState(viewType === 'STRUCT' ? 'model' : 'reference');
  const { editorInstance } = useContext(EditorContext);
  const t = useI18NPrefix('view.properties');

  useEffect(() => {
    editorInstance?.layout();
  }, [editorInstance, selectedTab]);

  useEffect(() => {
    setSelectedTab(viewType === 'STRUCT' ? 'model' : 'reference');
  }, [viewType]);

  const tabTitle = useMemo(() => {
    const tabTitle = [
      { name: 'reference', title: t('reference'), icon: <DatabaseOutlined /> },
      { name: 'variable', title: t('variable'), icon: <FunctionOutlined /> },
      { name: 'model', title: t('model'), icon: <ApartmentOutlined /> },
      {
        name: 'columnPermissions',
        title: t('columnPermissions'),
        icon: <SafetyCertificateOutlined />,
      },
    ];
    return viewType === 'STRUCT'
      ? tabTitle.slice(2, tabTitle.length)
      : tabTitle;
  }, [t, viewType]);

  const tabSelect = useCallback(tab => {
    setSelectedTab(tab);
  }, []);

  return allowManage ? (
    <Panel>
      <PanelHeader>
        <div>
          <strong>数据集配置</strong>
          <span>字段、变量与权限</span>
        </div>
      </PanelHeader>
      <PanelTabs>
        <Segmented
          block
          size="small"
          value={selectedTab}
          options={tabTitle.map(tab => ({
            value: tab.name,
            label: tab.title,
            icon: tab.icon,
          }))}
          onChange={value => tabSelect(String(value))}
        />
      </PanelTabs>
      <PanelBody>
        <PaneWrapper selected={selectedTab === 'variable'}>
          <ViewErrorBoundary><Variables /></ViewErrorBoundary>
        </PaneWrapper>
        <PaneWrapper selected={selectedTab === 'reference'}>
          <ViewErrorBoundary><Resource /></ViewErrorBoundary>
        </PaneWrapper>
        <PaneWrapper selected={selectedTab === 'model'}>
          <ViewErrorBoundary><DataModelTree /></ViewErrorBoundary>
        </PaneWrapper>
        <PaneWrapper selected={selectedTab === 'columnPermissions'}>
          <ViewErrorBoundary><ColumnPermissions /></ViewErrorBoundary>
        </PaneWrapper>
      </PanelBody>
    </Panel>
  ) : null;
});


const Panel = styled.aside`
  z-index: 1;
  display: flex;
  flex: 0 0 340px;
  flex-direction: column;
  width: 340px;
  min-width: 0;
  min-height: 0;
  background: ${p => p.theme.componentBackground};
  border-left: 1px solid ${p => p.theme.borderColorSplit};
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-height: 44px;
  padding: 6px 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  > div {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  strong {
    font-size: 13px;
    color: ${p => p.theme.textColor};
  }

  span {
    font-size: 11px;
    color: ${p => p.theme.textColorDisabled};
  }
`;

const PanelTabs = styled.div`
  flex-shrink: 0;
  padding: 8px 10px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  .ant-segmented-item-label {
    padding-inline: 6px;
    font-size: 11px;
  }
`;

const PanelBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
`;
