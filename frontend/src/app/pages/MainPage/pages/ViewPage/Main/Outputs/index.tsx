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

import { CheckCircleOutlined, GithubOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Popover, Space, Spin, Typography, theme } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import useResizeObserver from 'app/hooks/useResizeObserver';
import { selectSystemInfo } from 'app/slice/selectors';
import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { SPACE_TIMES } from 'styles/StyleConstants';
import { newIssueUrl } from 'utils/utils';
import { ViewViewModelStages } from '../../constants';
import { useViewSlice } from '../../slice';
import { selectCurrentEditingViewAttr } from '../../slice/selectors';
import { Error } from './Error';
import { Results } from './Results';

export const Outputs = memo(({ hidden = false }: { hidden?: boolean }) => {
  const { token } = theme.useToken();
  const { actions } = useViewSlice();
  const dispatch = useDispatch();
  const systemInfo = useSelector(selectSystemInfo);
  const t = useI18NPrefix('view');

  const error = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'error' }),
  ) as string;
  const stage = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'stage' }),
  ) as ViewViewModelStages;
  const warnings = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'warnings' }),
  ) as string[];

  const { width, height, ref } = useResizeObserver({
    refreshMode: 'debounce',
    refreshRate: 200,
  });

  const removeViewWarnings = useCallback(() => {
    dispatch(
      actions.changeCurrentEditingView({
        warnings: null,
      }),
    );
  }, [dispatch, actions]);

  const submitIssue = useCallback(
    type => {
      let params: any = {
        type: type,
        title: 'Sql parse bug',
      };
      if (type === 'github') {
        params.body = `version: ${systemInfo?.version}\n` + warnings.join('');
      } else {
        params.description =
          `version: ${systemInfo?.version}\n` + warnings.join('');
      }
      let url = newIssueUrl(params);
      window.open(url);
    },
    [warnings, systemInfo],
  );

  return (
    <div ref={ref} hidden={hidden} style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer }}>
      <PreviewHeader>
        <div>
          <Typography.Text strong>数据预览</Typography.Text>
          <Typography.Text type="secondary">运行数据集后在这里查看字段与结果</Typography.Text>
        </div>
        <PreviewStatus $running={stage === ViewViewModelStages.Running}>
          {stage === ViewViewModelStages.Running ? <LoadingOutlined spin /> : <CheckCircleOutlined />}
          <span>{stage === ViewViewModelStages.Running ? '正在执行' : stage > ViewViewModelStages.Fresh ? '结果已更新' : '等待运行'}</span>
        </PreviewStatus>
      </PreviewHeader>
      {warnings && (
        <Alert
          message={t('sqlRunWraning')}
          description={
            <Popover trigger={['click']} placement="top" overlayStyle={{ width: SPACE_TIMES(96) }} content={t('warningDescription')}>
              <Button type="link" size="small" style={{ padding: 0 }}>{t('detail')}</Button>
            </Popover>
          }
          type="warning"
          closable={false}
          action={
            <Space>
              <Button type="primary" icon={<GithubOutlined />} onClick={() => submitIssue('github')}>Github</Button>
              <Button type="primary" onClick={() => submitIssue('gitee')}>Gitee</Button>
              <Button onClick={removeViewWarnings}>{t('close')}</Button>
            </Space>
          }
        />
      )}
      <Results width={width} height={Math.max((height || 0) - 40, 0)} />
      {error && <Error />}
      {stage === ViewViewModelStages.Running && (
        <Flex align="center" justify="center" style={{ position: 'absolute', inset: 0, background: token.colorBgMask }}>
          <Spin />
        </Flex>
      )}
    </div>
  );
});

const PreviewHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  > div {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }

  .ant-typography {
    margin: 0;
    font-size: 12px;
  }
`;

const PreviewStatus = styled.div<{ $running: boolean }>`
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 11px;
  color: ${p => (p.$running ? p.theme.warning : p.theme.textColorSnd)};
`;
