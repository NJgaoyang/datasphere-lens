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

import { Empty, Tree as AntTree } from 'antd';
import { renderIcon } from 'app/hooks/useGetVizIcon';
import useResizeObserver from 'app/hooks/useResizeObserver';
import { WidgetActionContext } from 'app/pages/DashBoardPage/components/ActionProvider/WidgetActionProvider';
import widgetManager from 'app/pages/DashBoardPage/components/WidgetManager';
import { FC, memo, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { stopPPG } from 'utils/utils';
import { dropLayerNodeAction } from '../../slice/actions/actions';
import {
  selectEditingWidgetIds,
  selectLayerTree,
  selectSelectedIds,
} from '../../slice/selectors';
import { EventLayerNode, LayerTreeItem } from './LayerTreeItem';
import { filterLayerTree } from './utils';

export const LayerTree: FC<{ keyword?: string }> = memo(({ keyword = '' }) => {
  const dispatch = useDispatch();
  const treeData = useSelector(selectLayerTree);
  const filteredTreeData = useMemo(
    () =>
      filterLayerTree(treeData, keyword, node =>
        widgetManager.toolkit(node.originalType).getName(),
      ),
    [keyword, treeData],
  );
  const renderTreeItem = useCallback(n => <LayerTreeItem node={n} />, []);
  const { onEditSelectWidget } = useContext(WidgetActionContext);
  const editingWidgetIds = useSelector(selectEditingWidgetIds);
  const selectedIds = useSelector(selectSelectedIds);

  const { height, ref } = useResizeObserver({
    refreshMode: 'debounce',
    refreshRate: 200,
  });

  const treeSelect = useCallback(
    (_, { node, nativeEvent }) => {
      onEditSelectWidget({
        multipleKey: nativeEvent.shiftKey,
        id: node.key as string,
        selected: true,
      });
    },
    [onEditSelectWidget],
  );

  const icon = useCallback(
    node => renderIcon(widgetManager.meta(node.originalType).icon),
    [],
  );

  const onDrop = useCallback(
    info => {
      const dragNode = info.dragNode as EventLayerNode;
      const targetNode = info.node as EventLayerNode;
      let dropPosition = 'NORMAL';

      if (targetNode.dragOverGapTop) {
        dropPosition = 'TOP';
      }
      if (targetNode.dragOver && !targetNode.isLeaf) {
        dropPosition = 'FOLDER';
      }

      dispatch(dropLayerNodeAction(dragNode, targetNode, dropPosition));
    },
    [dispatch],
  );

  return (
    <TreeViewport ref={ref} onClick={stopPPG}>
      {filteredTreeData.length ? (
        <LensTree
          blockNode
          showIcon
          draggable={!keyword && !editingWidgetIds ? { icon: false } : false}
          multiple
          titleRender={renderTreeItem}
          icon={icon}
          onSelect={treeSelect}
          onDrop={onDrop}
          treeData={filteredTreeData}
          selectedKeys={selectedIds ? selectedIds.split(',') : []}
          height={height}
          defaultExpandAll
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配图层" />
      )}
    </TreeViewport>
  );
});

const TreeViewport = styled.div`
  flex: 1;
  min-height: 0;
  padding: 6px 8px 10px;
  overflow: auto;
`;

const LensTree = styled(AntTree)`
  background: transparent;

  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    min-height: 32px;
    padding: 1px 0;
  }

  .ant-tree-node-content-wrapper {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    min-height: 30px;
    padding: 0 6px;
    border-radius: 6px;
  }

  .ant-tree-node-content-wrapper:hover {
    background: ${p => p.theme.bodyBackground};
  }

  .ant-tree-node-content-wrapper.ant-tree-node-selected {
    color: ${p => p.theme.primary};
    background: ${p => p.theme.emphasisBackground} !important;
  }

  .ant-tree-iconEle {
    display: inline-flex;
    align-items: center;
    color: ${p => p.theme.textColorDisabled};
  }
`;
