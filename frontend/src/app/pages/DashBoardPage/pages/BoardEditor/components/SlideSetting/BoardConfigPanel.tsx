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

import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import { BoardConfigContext } from 'app/pages/DashBoardPage/components/BoardProvider/BoardConfigProvider';
import { ChartStyleConfig } from 'app/types/ChartConfig';
import { FC, memo, useContext } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { BoardConfigCollapse } from './WidgetConfigPanel';
import { editBoardStackActions } from '../../slice';

const StyledWrapper = styled.div`
  width: 100%;
  min-height: 0;
  overflow-y: auto;
`;
export const BoardConfigPanel: FC<{}> = memo(() => {
  const dispatch = useDispatch();
  const boardConfig = useContext(BoardConfigContext);
  const configs = boardConfig.jsonConfig.props;
  const i18ns = boardConfig.jsonConfig.i18ns;
  const onChange = (
    ancestors: number[],
    configItem: ChartStyleConfig,
    needRefresh?: boolean,
  ) => {
    dispatch(
      editBoardStackActions.updateBoardConfigByKey({ ancestors, configItem }),
    );
  };
  return (
    <ChartI18NContext.Provider value={{ i18NConfigs: i18ns }}>
      <StyledWrapper onClick={e => e.stopPropagation()}>
        <BoardConfigCollapse configs={configs} onChange={onChange} />
      </StyledWrapper>
    </ChartI18NContext.Provider>
  );
});
