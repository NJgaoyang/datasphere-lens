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
import { Divider, Space } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { BoardActionContext } from 'app/pages/DashBoardPage/components/ActionProvider/BoardActionProvider';
import useBoardEditorHotkeys from 'app/pages/DashBoardPage/hooks/useBoardEditorHotkeys';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { WidgetActionContext } from '../../../../components/ActionProvider/WidgetActionProvider';
import { AddChart } from './AddChart/AddChart';
import { AddContainer } from './AddContainer/AddContainer';
import { AddController } from './AddControler/AddControler';
import { AddMedia } from './AddMedia/AddMedia';
import { BoardToolRights } from './BoardToolRights';
import { BoardToolBarContext } from './context/BoardToolBarContext';
import { CopyBtn, PasteBtn } from './CopyPaste/CopyPaste';
import { DelWidgetsBtn } from './DelWidgetsBtn';
import { DeviceSwitcher } from './DeviceSwitch/DeviceSwitcher';
import { ToBottomBtn, ToTopBtn } from './ToTopToBottom/ToTopToBottom';
import { RedoBtn, UndoBtn } from './UndoRedo/UndoRedo';

export const ToolBar = () => {
  const ssp = e => {
    e.stopPropagation();
  };
  const { boardType } = useContext(BoardToolBarContext);
  const {
    onEditLayerToTop,
    onEditLayerToBottom,
    onEditCopyWidgets,
    onEditPasteWidgets,
    onEditDeleteActiveWidgets,
  } = useContext(WidgetActionContext);
  const { undo, redo } = useContext(BoardActionContext);
  //
  useBoardEditorHotkeys();

  const t = useI18NPrefix(`viz.board.action`);
  return (
    <Wrapper onClick={ssp}>
      <ToolbarGroups>
        <ToolGroup>
          <GroupLabel>添加</GroupLabel>
          <Space size={2}>
            <AddChart />
            <AddController />
            <AddMedia />
            <AddContainer />
          </Space>
        </ToolGroup>
        <Divider type="vertical" />
        <ToolGroup>
          <GroupLabel>编辑</GroupLabel>
          <Space size={2}>
            <UndoBtn fn={undo} title={t('undo')} />
            <RedoBtn fn={redo} title={t('redo')} />
            <DelWidgetsBtn fn={onEditDeleteActiveWidgets} title={t('delete')} />
            <ToTopBtn fn={onEditLayerToTop} title={t('toTop')} />
            <ToBottomBtn fn={onEditLayerToBottom} title={t('toBottom')} />
            <CopyBtn fn={onEditCopyWidgets} title={t('copy')} />
            <PasteBtn fn={onEditPasteWidgets} title={t('paste')} />
          </Space>
        </ToolGroup>
        {boardType === 'auto' && (
          <>
            <Divider type="vertical" />
            <ToolGroup>
              <GroupLabel>设备</GroupLabel>
              <DeviceSwitcher />
            </ToolGroup>
          </>
        )}
      </ToolbarGroups>
      <BoardToolRights />
    </Wrapper>
  );
};
const Wrapper = styled.div`
  z-index: 0;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const ToolbarGroups = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const GroupLabel = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  color: ${p => p.theme.textColorDisabled};
`;
