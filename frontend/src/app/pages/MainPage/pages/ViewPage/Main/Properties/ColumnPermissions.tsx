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

import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, theme } from 'antd';
import { ListItem, Popup, Tree } from 'app/components';
import { ViewFieldMeta } from 'app/types/View';
import { useDebouncedSearch } from 'app/hooks/useDebouncedSearch';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDatasetFieldDisplayName,
  getFieldDisplayName,
  uuidv4,
} from 'utils/utils';
import { selectRoles } from '../../../MemberPage/slice/selectors';
import { SubjectTypes } from '../../../PermissionPage/constants';
import { ViewStatus, ViewViewModelStages } from '../../constants';
import { useViewSlice } from '../../slice';
import { selectCurrentEditingViewAttr } from '../../slice/selectors';
import { ColumnPermission, HierarchyModel } from '../../slice/types';
import { findViewFieldMeta } from '../../utils';
import Container from './Container';

export const ColumnPermissions = memo(() => {
  const { actions } = useViewSlice();
  const dispatch = useDispatch();
  const viewId = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'id' }),
  ) as string;
  const stage = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'stage' }),
  ) as ViewViewModelStages;
  const status = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'status' }),
  ) as ViewStatus;
  const model = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'model' }),
  ) as HierarchyModel;
  const viewFields = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'fields' }),
  ) as ViewFieldMeta[] | undefined;
  const columnPermissions = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'columnPermissions' }),
  ) as ColumnPermission[];
  const roles = useSelector(selectRoles);
  const t = useI18NPrefix('view.columnPermission');
  const { token } = theme.useToken();

  const { filteredData, debouncedSearch } = useDebouncedSearch(
    roles,
    (keywords, data) => data.name.includes(keywords),
  );

  const checkColumnPermission = useCallback(
    roleId => checkedKeys => {
      const index = columnPermissions.findIndex(
        ({ subjectId }) => subjectId === roleId,
      );

      if (index >= 0) {
        if (
          Object.keys(model?.columns || {})
            .sort()
            .join(',') !== checkedKeys.sort().join(',')
        ) {
          dispatch(
            actions.changeCurrentEditingView({
              columnPermissions: [
                ...columnPermissions.slice(0, index),
                {
                  ...columnPermissions[index],
                  columnPermission: checkedKeys,
                },
                ...columnPermissions.slice(index + 1),
              ],
            }),
          );
        } else {
          dispatch(
            actions.changeCurrentEditingView({
              columnPermissions: columnPermissions.filter(
                (_, i) => index !== i,
              ),
            }),
          );
        }
      } else {
        dispatch(
          actions.changeCurrentEditingView({
            columnPermissions: columnPermissions.concat({
              id: uuidv4(),
              viewId,
              subjectId: roleId,
              subjectType: SubjectTypes.Role,
              columnPermission: checkedKeys,
            }),
          }),
        );
      }
    },
    [dispatch, actions, viewId, model, columnPermissions],
  );

  const columnDropdownData = useMemo(
    () =>
      Object.entries(model?.columns || {}).map(([name, column]) => ({
        key: name,
        title: (() => {
          const field = findViewFieldMeta(
            { fieldId: column.fieldId, name, path: column.name },
            viewFields,
          );
          return field
            ? getDatasetFieldDisplayName(field)
            : getFieldDisplayName({ ...column, name });
        })(),
        value: name,
      })),
    [model?.columns, viewFields],
  );

  const renderItem = useCallback(
    ({ id, name }) => {
      const permission = columnPermissions.find(
        ({ subjectId }) => subjectId === id,
      );
      const checkedKeys = permission
        ? permission.columnPermission || []
        : columnDropdownData.map(({ key }) => key);

      return (
        <ListItem
          actions={[
            <Popup
              trigger={['click']}
              placement="bottomRight"
              content={
                <Tree
                  className="check-list medium"
                  treeData={columnDropdownData}
                  checkedKeys={checkedKeys}
                  loading={false}
                  selectable={false}
                  showIcon={false}
                  onCheck={checkColumnPermission(id)}
                  disabled={status === ViewStatus.Archived}
                  blockNode
                  checkable
                />
              }
            >
              <Button
                type="link"
                size="small"
                danger={!!permission}
              >
                {permission
                  ? (checkedKeys || []).length > 0
                    ? t('partial')
                    : t('none')
                  : t('all')}
              </Button>
            </Popup>,
          ]}
        >
          <List.Item.Meta title={name} />
        </ListItem>
      );
    },
    [columnDropdownData, columnPermissions, checkColumnPermission, status, t],
  );

  return (
    <Container title="columnPermissions">
      <Input
        allowClear
        prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
        placeholder={t('search')}
        variant="borderless"
        onChange={debouncedSearch}
        style={{ marginBottom: token.marginXS }}
      />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: token.paddingSM }}>
        <List
          dataSource={filteredData}
          loading={
            stage === ViewViewModelStages.Loading && {
              indicator: <LoadingOutlined />,
            }
          }
          renderItem={renderItem}
        />
      </div>
    </Container>
  );
});

