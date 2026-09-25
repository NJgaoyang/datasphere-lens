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
import { WidgetWrapProvider } from 'app/pages/DashBoardPage/components/WidgetProvider/WidgetWrapProvider';
import { FC, memo, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { BoardContext } from '../../../../components/BoardProvider/BoardProvider';
import { selectSelectedIds } from '../../slice/selectors';
import { BoardConfigPanel } from './BoardConfigPanel';
import WidgetSetting from './WidgetSetting';

export const SlideSetting: FC<{}> = memo(() => {
  const { boardId } = useContext(BoardContext);
  const selectedIds = useSelector(selectSelectedIds);
  const { type, selectedIdArr } = useMemo(() => {
    const selectedIdArr = selectedIds ? selectedIds.split(',') : [];
    const type = selectedIdArr.length === 1 ? 'widget' : 'board';
    return { type, selectedIdArr };
  }, [selectedIds]);
  return (
    <Wrapper>
      <PanelHeader>
        <strong>{type === 'board' ? '页面设置' : '组件设置'}</strong>
        <span>{type === 'board' ? '仪表板' : '已选组件'}</span>
      </PanelHeader>
      <PanelBody>
        {type === 'board' && <BoardConfigPanel />}
        {type === 'widget' && (
          <WidgetWrapProvider
            id={selectedIdArr[0]}
            boardEditing={true}
            boardId={boardId}
          >
            <WidgetSetting boardId={boardId} />
          </WidgetWrapProvider>
        )}
      </PanelBody>
    </Wrapper>
  );
});

export default SlideSetting;

const Wrapper = styled.div<{}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background-color: ${p => p.theme.componentBackground};
  border-left: 1px solid ${p => p.theme.borderColorSplit};
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  strong {
    font-size: 13px;
    color: ${p => p.theme.textColor};
  }

  span {
    font-size: 11px;
    color: ${p => p.theme.textColorDisabled};
  }
`;

const PanelBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
`;
