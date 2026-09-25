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
  FormOutlined,
  InfoCircleOutlined,
  NumberOutlined,
  SearchOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {
  Button,
  Empty,
  Input,
  message,
  Space,
  Spin,
  Tooltip,
  TreeSelect,
} from 'antd';
import { LensToolButton } from 'app/components/LensWorkspace';
import { Confirm, ConfirmProps } from 'app/components/Confirm';
import {
  ChartDataViewFieldCategory,
  DataViewFieldType,
} from 'app/constants';
import { useDebouncedSearch } from 'app/hooks/useDebouncedSearch';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import useMount from 'app/hooks/useMount';
import useStateModal, { StateModalSize } from 'app/hooks/useStateModal';
import ChartAggregationContext from 'app/pages/ChartWorkbenchPage/contexts/ChartAggregationContext';
import ChartDataViewContext from 'app/pages/ChartWorkbenchPage/contexts/ChartDataViewContext';
import workbenchSlice from 'app/pages/ChartWorkbenchPage/slice';
import {
  dataviewsSelector,
  makeDataviewTreeSelector,
  viewDetailLoadingSelector,
} from 'app/pages/ChartWorkbenchPage/slice/selectors';
import { ChartConfigReducerActionType } from 'app/pages/ChartWorkbenchPage/slice/constant';
import { fetchViewDetailAction } from 'app/pages/ChartWorkbenchPage/slice/thunks';
import { useAccess, useCascadeAccess } from 'app/pages/MainPage/Access';
import {
  PermissionLevels,
  ResourceTypes,
} from 'app/pages/MainPage/pages/PermissionPage/constants';
import { ChartConfig } from 'app/types/ChartConfig';
import ChartDataView from 'app/types/ChartDataView';
import { ChartDataViewMeta } from 'app/types/ChartDataViewMeta';
import { getAllColumnInMeta } from 'app/utils/chartHelper';
import { checkComputedFieldAsync } from 'app/utils/fetch';
import { updateByKey } from 'app/utils/mutation';
import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getDatasetFieldDisplayName } from 'utils/utils';
import {
  ORANGE,
  SPACE,
  SPACE_MD,
  SPACE_TIMES,
  SPACE_XS,
} from 'styles/StyleConstants';
import { getPath } from 'utils/utils';
import { placeFieldInChartConfig } from '../../fieldPlacement';
import { getAllFieldsOfEachType } from '../../utils';
import { ChartDraggableSourceGroupContainer } from '../ChartDraggable';
import ChartComputedFieldSettingPanel from './components/ChartComputedFieldSettingPanel';

const ChartDataViewPanel: FC<{
  dataView?: ChartDataView;
  defaultViewId?: string;
  chartConfig?: ChartConfig;
  onDataViewChange?: (clear?: boolean) => void;
  onChartConfigChange?: (type, payload) => void;
}> = memo(({
  dataView,
  defaultViewId,
  chartConfig,
  onDataViewChange,
  onChartConfigChange,
}) => {
  const t = useI18NPrefix(`viz.workbench.dataview`);
  const tView = useI18NPrefix('view');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, modalContextHolder] = useStateModal({});
  const { availableSourceFunctions } = useContext(ChartDataViewContext);
  const { aggregation } = useContext(ChartAggregationContext);
  const dataviewTreeSelector = useMemo(makeDataviewTreeSelector, []);
  const getSelectable = useCallback(v => !v.isFolder, []);
  const dataviewTreeData = useSelector(state =>
    dataviewTreeSelector(state, getSelectable),
  );
  const [confirmProps, setConfirmProps] = useState<ConfirmProps>({});

  const views = useSelector(dataviewsSelector);
  const viewDetailLoading = useSelector(viewDetailLoadingSelector);
  const [allMetaFields, setAllMetaFields] = useState<ChartDataViewMeta[]>([]);
  const [sortType, setSortType] = useState<string>('byNameSort');

  const path = useMemo(() => {
    return views?.length && dataView
      ? getPath(
          views as Array<{ id: string; parentId: string }>,
          { id: dataView.id, parentId: dataView.parentId },
          ResourceTypes.View,
        )
      : [];
  }, [views, dataView]);

  const managePermission = useCascadeAccess({
    module: ResourceTypes.View,
    path,
    level: PermissionLevels.Manage,
  });
  const allowManage = managePermission(true);
  const allowEnableView = useAccess({
    type: 'module',
    module: ResourceTypes.View,
    id: '',
    level: PermissionLevels.Enable,
  })(true);

  const { filteredData: filteredTreeData, debouncedSearch: treeSearch } =
    useDebouncedSearch(allMetaFields, (keywords, d) => {
      const lowerKeyword = keywords.toLowerCase();
      return [
        getDatasetFieldDisplayName(d),
        d?.name,
        d?.comment,
        d?.path?.join('.'),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(lowerKeyword));
    });

  const handleDataViewChange = useCallback(
    value => {
      if (dataView?.id === value) {
        return false;
      }
      let Data = chartConfig?.datas?.filter(v => v.rows && v.rows.length);
      if (Data?.length) {
        setConfirmProps({
          visible: true,
          title: t('toggleViewTip'),
          width: 500,
          icon: <InfoCircleOutlined style={{ color: ORANGE }} />,
          footer: (
            <Space>
              <Button onClick={() => setConfirmProps({ visible: false })}>
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  onDataViewChange?.(true);
                  setConfirmProps({ visible: false });
                  dispatch(fetchViewDetailAction(value));
                }}
              >
                {t('empty')}
              </Button>
              <Button
                onClick={() => {
                  onDataViewChange?.();
                  setConfirmProps({ visible: false });
                  dispatch(fetchViewDetailAction(value));
                }}
                type="primary"
              >
                {t('reserve')}
              </Button>
            </Space>
          ),
        });
      } else {
        onDataViewChange?.();
        dispatch(fetchViewDetailAction(value));
      }
    },
    [chartConfig?.datas, dataView?.id, dispatch, onDataViewChange, t],
  );

  const filterDateViewTreeNode = useCallback(
    (inputValue, node) =>
      node.title.toLowerCase().includes(inputValue.toLowerCase()),
    [],
  );

  const handleAddNewOrUpdateComputedField = useCallback(
    async (field?: ChartDataViewMeta, originId?: string) => {
      if (!field) {
        return Promise.reject('field is empty');
      }

      try {
        await checkComputedFieldAsync(dataView?.sourceId, field.expression);
      } catch (error) {
        message.error(error as any);
        return;
      }

      const otherComputedFields = dataView?.computedFields?.filter(
        f => f.name !== originId,
      );
      const isNameConflict = !!otherComputedFields?.find(
        f => f.name === field?.name,
      );
      if (isNameConflict) {
        const nameConflictError = tView('computedFieldNameExistWarning');
        message.error(nameConflictError);
        return Promise.reject(nameConflictError);
      }

      const currentFieldIndex = (dataView?.computedFields || []).findIndex(
        f => f.name === originId,
      );

      if (currentFieldIndex >= 0) {
        const newComputedFields = updateByKey(
          dataView?.computedFields,
          currentFieldIndex,
          field,
        );
        dispatch(
          workbenchSlice.actions.updateCurrentDataViewComputedFields(
            newComputedFields!,
          ),
        );
        return;
      }
      const newComputedFields = (dataView?.computedFields || []).concat([
        field,
      ]);
      dispatch(
        workbenchSlice.actions.updateCurrentDataViewComputedFields(
          newComputedFields,
        ),
      );
    },
    [dataView?.computedFields, dataView?.sourceId, dispatch, tView],
  );

  const handleDeleteComputedField = fieldId => {
    const newComputedFields = (dataView?.computedFields || []).filter(
      f => f.name !== fieldId,
    );

    dispatch(
      workbenchSlice.actions.updateCurrentDataViewComputedFields(
        newComputedFields,
      ),
    );
  };

  const handleEditComputedField = fieldId => {
    const editField = (dataView?.computedFields || []).find(
      f => f.name === fieldId,
    );

    handleAddOrEditComputedField(editField);
  };

  const buildFieldsForComputedFieldSettingPanel = useCallback(
    meta => {
      if (dataView?.type === 'SQL') {
        return getAllColumnInMeta(meta);
      } else {
        const allColumn = getAllColumnInMeta(meta);
        const tableNameList: string[] = [];
        const columnNameObj: { [key: string]: any } = {};
        const columnTreeData: any = [];

        allColumn?.forEach((v, i) => {
          const path = v.path;
          const tableName = path?.slice(0, path?.length - 1).join('.') || '';
          if (!tableNameList.includes(tableName)) {
            tableNameList.push(tableName);
          }
        });

        allColumn?.forEach((v, i) => {
          const path = v.path;
          const tableName = path?.slice(0, path?.length - 1).join('.') || '';
          if (tableNameList.includes(tableName)) {
            const fieldName = path?.[path.length - 1];
            const displayLabel = getDatasetFieldDisplayName({
              fieldId: v.fieldId,
              originName: v.originName,
              sourceComment: v.sourceComment,
              customName: v.customName,
              name: fieldName,
              path: v.path,
              displayName: v.displayName,
              comment: v.comment,
              isDisplayNameCustom: v.isDisplayNameCustom,
            });
            const columnNameArr = columnNameObj[tableName];
            columnNameObj[tableName] = columnNameArr
              ? [...columnNameArr, { title: displayLabel, key: path }]
              : [{ title: displayLabel, key: path }];
          }
        });

        tableNameList.forEach(v => {
          columnTreeData.push({
            title: v,
            key: v,
            selectable: false,
            children: columnNameObj[v],
          });
        });

        return columnTreeData;
      }
    },
    [dataView?.type],
  );

  const handleAddOrEditComputedField = useCallback(
    (field?: ChartDataViewMeta) => {
      const modalContentKey = `${field?.name || 'new'}-${Date.now()}`;
      (showModal as Function)({
        title: t('createComputedFields'),
        modalSize: StateModalSize.MIDDLE,
        content: onChange => (
          <ChartComputedFieldSettingPanel
            key={modalContentKey}
            computedField={field}
            sourceId={dataView?.sourceId}
            fields={buildFieldsForComputedFieldSettingPanel(dataView?.meta)}
            variables={dataView?.meta?.filter(
              c => c.category === ChartDataViewFieldCategory.Variable,
            )}
            allComputedFields={dataView?.computedFields}
            viewType={dataView?.type}
            onChange={onChange}
          />
        ),
        onOk: newField =>
          handleAddNewOrUpdateComputedField(newField, field?.name),
        onButtonProps: { display: field?.isViewComputedFields },
      });
    },
    [
      buildFieldsForComputedFieldSettingPanel,
      dataView?.computedFields,
      dataView?.meta,
      dataView?.type,
      dataView?.sourceId,
      handleAddNewOrUpdateComputedField,
      showModal,
      t,
    ],
  );

  const noGroupMetaFields = useCallback(
    sortType => {
      const {
        hierarchyFields,
        dateLevelFields,
        stringFields,
        numericFields,
        stringComputedFields,
        numericComputedFields,
        dateComputedFields,
      } = getAllFieldsOfEachType({
        sortType,
        dataView,
        availableSourceFunctions,
      });
      return [
        ...hierarchyFields,
        ...stringFields,
        ...stringComputedFields,
        ...dateComputedFields,
        ...dateLevelFields,
        ...numericFields,
        ...numericComputedFields,
      ];
    },
    [availableSourceFunctions, dataView],
  );

  const buildAllMetaFields = useCallback(
    sortType => {
      setAllMetaFields(noGroupMetaFields(sortType));
    },
    [noGroupMetaFields],
  );

  const dimensionFields = useMemo(
    () =>
      (filteredTreeData || []).filter(
        field => field.type !== DataViewFieldType.NUMERIC,
      ) as ChartDataViewMeta[],
    [filteredTreeData],
  );
  const measureFields = useMemo(
    () =>
      (filteredTreeData || []).filter(
        field => field.type === DataViewFieldType.NUMERIC,
      ) as ChartDataViewMeta[],
    [filteredTreeData],
  );

  const handleFieldDoubleClick = useCallback(
    (field: ChartDataViewMeta) => {
      const placement = placeFieldInChartConfig(
        chartConfig,
        field,
        aggregation,
      );
      if (!placement) {
        message.warning('当前图表没有可用的字段位置');
        return;
      }
      onChartConfigChange?.(ChartConfigReducerActionType.DATA, {
        ancestors: [placement.sectionIndex],
        value: placement.section,
        needRefresh: true,
      });
    },
    [aggregation, chartConfig, onChartConfigChange],
  );

  const editView = useCallback(() => {
    let orgId = dataView?.orgId as string;
    let viewId = dataView?.id as string;
    navigate(`/organizations/${orgId}/datasets/${viewId}`);
  }, [dataView?.id, dataView?.orgId, navigate]);

  const handleConfirmVisible = useCallback(() => {
    (showModal as Function)({
      title: '',
      modalSize: StateModalSize.XSMALL,
      content: () => t('editViewTip'),
      onOk: editView,
    });
  }, [editView, showModal, t]);

  useMount(() => {
    if (defaultViewId) {
      handleDataViewChange(defaultViewId);
    }
  });

  useEffect(() => {
    buildAllMetaFields(sortType);
  }, [buildAllMetaFields, sortType]);

  return (
    <StyledChartDataViewPanel>
      <Header>
        <DatasetLabel>数据集</DatasetLabel>
        <TreeSelect
          showSearch
          placeholder={t('plsSelectDataView')}
          className="view-selector"
          treeData={dataviewTreeData}
          value={dataView?.id}
          onChange={handleDataViewChange}
          filterTreeNode={filterDateViewTreeNode}
          bordered={false}
        />
        <Tooltip placement="topLeft" title={t('editView')}>
          <LensToolButton
            disabled={!(allowEnableView && allowManage && dataView)}
            iconSize={14}
            icon={<FormOutlined />}
            size="small"
            onClick={handleConfirmVisible}
          />
        </Tooltip>
        {modalContextHolder}
      </Header>
      <FieldToolbar>
        <Input
          allowClear
          className="search-input"
          prefix={<SearchOutlined className="icon" />}
          placeholder="搜索字段"
          onChange={treeSearch}
        />
        <Button
          type="link"
          size="small"
          onClick={() => handleAddOrEditComputedField()}
        >
          + 计算字段
        </Button>
      </FieldToolbar>
      <Confirm {...confirmProps} />

      {viewDetailLoading ? (
        <FieldState>
          <Spin size="small" />
          <span>正在加载字段...</span>
        </FieldState>
      ) : filteredTreeData?.length ? (
        <FieldLibrary>
          <FieldSection>
            <FieldSectionHeader>
              <Space size={6}>
                <TagsOutlined />
                <strong>维度</strong>
              </Space>
              <span>{dimensionFields.length}</span>
            </FieldSectionHeader>
            {dimensionFields.length ? (
              <ChartDraggableSourceGroupContainer
                meta={dimensionFields}
                onDeleteComputedField={handleDeleteComputedField}
                onEditComputedField={handleEditComputedField}
                onFieldDoubleClick={handleFieldDoubleClick}
              />
            ) : (
              <FieldSectionEmpty>暂无维度字段</FieldSectionEmpty>
            )}
          </FieldSection>
          <FieldSection>
            <FieldSectionHeader>
              <Space size={6}>
                <NumberOutlined />
                <strong>度量</strong>
              </Space>
              <span>{measureFields.length}</span>
            </FieldSectionHeader>
            {measureFields.length ? (
              <ChartDraggableSourceGroupContainer
                meta={measureFields}
                onDeleteComputedField={handleDeleteComputedField}
                onEditComputedField={handleEditComputedField}
                onFieldDoubleClick={handleFieldDoubleClick}
              />
            ) : (
              <FieldSectionEmpty>暂无度量字段</FieldSectionEmpty>
            )}
          </FieldSection>
        </FieldLibrary>
      ) : (
        <FieldState>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={dataView ? '当前数据集没有可用字段' : '请选择数据集'}
          />
        </FieldState>
      )}
    </StyledChartDataViewPanel>
  );
});

export default ChartDataViewPanel;

const StyledChartDataViewPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${p => p.theme.componentBackground};
  border-right: 1px solid ${p => p.theme.borderColorSplit};
`;

const Header = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-height: 38px;
  padding: 3px 6px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  .view-selector {
    flex: 1;
    overflow: hidden;
  }
`;

const DatasetLabel = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textColorSnd};
`;

const FieldToolbar = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  .search-input {
    min-width: 0;
  }
`;

const FieldLibrary = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const FieldSection = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  & + & {
    border-top: 1px solid ${p => p.theme.borderColorSplit};
  }
`;

const FieldSectionHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  padding: 0 10px;
  font-size: 12px;
  color: ${p => p.theme.textColorSnd};
  background: ${p => p.theme.bodyBackground};

  strong {
    color: ${p => p.theme.textColor};
  }
`;

const FieldSectionEmpty = styled.div`
  padding: 18px 12px;
  font-size: 12px;
  color: ${p => p.theme.textColorDisabled};
  text-align: center;
`;

const FieldState = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: ${p => p.theme.textColorSnd};
`;
