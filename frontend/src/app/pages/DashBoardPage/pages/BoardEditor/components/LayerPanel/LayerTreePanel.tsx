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
  LensPanel,
  LensPanelHeader,
  LensSearch,
  LensToolbar,
} from 'app/components/LensWorkspace';
import { DeviceType } from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { FC, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { LayerTree } from './LayerTree';
import { MobileAppearancePanel } from './MobileAppearancePanel';
import { selectDeviceType } from '../../slice/selectors';

export const LayerTreePanel: FC<{}> = memo(() => {
  const deviceType = useSelector(selectDeviceType);
  const [keyword, setKeyword] = useState('');
  return (
    <Panel $edge="right">
      {deviceType === DeviceType.Mobile ? (
        <MobileAppearancePanel />
      ) : (
        <>
          <LensPanelHeader title="图层" description="管理画布组件与层级" />
          <LensToolbar>
            <LensSearch
              allowClear
              size="small"
              value={keyword}
              placeholder="搜索图层名称或组件类型"
              onChange={event => setKeyword(event.target.value)}
            />
          </LensToolbar>
          <LayerTree keyword={keyword} />
        </>
      )}
    </Panel>
  );
});
const Panel = styled(LensPanel)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  .ant-tree-treenode-selected .ant-tree-node-content-wrapper {
    background: ${p => p.theme.emphasisBackground};
    border-radius: 6px;
  }

  .ant-tree-treenode:hover .ant-tree-node-content-wrapper {
    border-radius: 6px;
  }
`;
