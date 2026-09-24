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
  CaretRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Form, message, Space, Spin, Steps, Tooltip, Typography, theme } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { CommonFormTypes } from 'globalConstants';
import { produce } from 'immer';
import { memo, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEqualObject } from 'utils/object';
import { getInsertedNodeIndex } from 'utils/utils';
import {
  StructViewJoinType,
  ViewStatus,
  ViewViewModelStages,
} from '../../constants';
import { EditorContext } from '../../EditorContext';
import { SaveFormContext } from '../../SaveFormContext';
import { useViewSlice } from '../../slice';
import {
  selectAllSourceDatabaseSchemas,
  selectCurrentEditingViewAttr,
  selectViews,
} from '../../slice/selectors';
import { runSql, saveView } from '../../slice/thunks';
import { JoinTableProps, StructViewQueryProps } from '../../slice/types';
import { handleStringScriptToObject, isNewView } from '../../utils';
import { Toolbar } from '../Editor/Toolbar';
import SelectDataSource from './components/SelectDataSource';
import SelectJoinColumns from './components/SelectJoinColumns';
import SelectJoinType from './components/SelectJoinType';

interface StructViewProps {
  allowManage: boolean;
  allowEnableViz: boolean | undefined;
}

export const StructView = memo(
  ({ allowManage, allowEnableViz }: StructViewProps) => {
    const { actions } = useViewSlice();
    const dispatch = useDispatch();
    const { initActions } = useContext(EditorContext);
    const { showSaveForm } = useContext(SaveFormContext);
    const t = useI18NPrefix(`view.structView`);
    const { token } = theme.useToken();

    const structure = useSelector(state =>
      selectCurrentEditingViewAttr(state, { name: 'script' }),
    ) as StructViewQueryProps;
    const id = useSelector(state =>
      selectCurrentEditingViewAttr(state, { name: 'id' }),
    ) as string;
    const sourceId = useSelector(state =>
      selectCurrentEditingViewAttr(state, { name: 'sourceId' }),
    ) as string;
    const stage = useSelector(state =>
      selectCurrentEditingViewAttr(state, { name: 'stage' }),
    ) as ViewViewModelStages;
    const status = useSelector(state =>
      selectCurrentEditingViewAttr(state, { name: 'status' }),
    ) as ViewStatus;
    const viewsData = useSelector(selectViews);
    const allDatabaseSchemas = useSelector(selectAllSourceDatabaseSchemas);
    const [form] = Form.useForm();
    const encodeJoinConditionValue = useCallback(
      (path?: string[]) => (path?.length ? JSON.stringify(path) : undefined),
      [],
    );

    const handleStructureChange = useCallback(
      (table: any, type: 'MAIN' | 'JOINS', index?: number) => {
        dispatch(
          actions.changeCurrentEditingView({
            script:
              type === 'MAIN'
                ? {
                    ...structure,
                    ...table,
                    joins:
                      !table.table ||
                      isEqualObject(structure.table, table.table)
                        ? structure.joins
                        : [],
                  }
                : produce(structure, draft => {
                    draft.joins[index!] = table;
                  }),
          }),
        );
        if (type === 'MAIN' && table.sourceId) {
          dispatch(
            actions.changeCurrentEditingView({
              sourceId: table.sourceId,
            }),
          );
        }
      },
      [structure, dispatch, actions],
    );

    const handleAddTableJoin = useCallback(() => {
      dispatch(
        actions.changeCurrentEditingView({
          script: produce(structure, draft => {
            draft.joins.push({ joinType: StructViewJoinType.LeftJoin });
          }),
        }),
      );
    }, [structure, dispatch, actions]);

    const handleTableJoinType = useCallback(
      (type: StructViewJoinType, index: number) => {
        dispatch(
          actions.changeCurrentEditingView({
            script: produce(structure, draft => {
              draft.joins[index].joinType = type;
            }),
          }),
        );
      },
      [structure, dispatch, actions],
    );

    const handleTableJoin = useCallback(
      (table: any, type: 'MAIN' | 'JOINS', index: number) => {
        handleStructureChange(
          {
            ...(structure?.joins?.[index] || {}),
            ...table,
            conditions: structure?.joins?.[index]?.conditions || [
              { left: [], right: [] },
            ],
          },
          type,
          index,
        );
      },
      [structure, handleStructureChange],
    );

    const handleTableJoinColumns = useCallback(
      (
        columnName: [string],
        type: 'left' | 'right',
        joinIndex: number,
        joinConditionIndex: number,
      ) => {
        handleStructureChange(
          produce(structure?.joins?.[joinIndex], draft => {
            draft.conditions![joinConditionIndex][type] = columnName;
          }),
          'JOINS',
          joinIndex,
        );
      },
      [structure, handleStructureChange],
    );

    const handleTableJoinAddColumns = useCallback(
      (index: number) => {
        handleStructureChange(
          produce(structure?.joins?.[index], draft => {
            draft.conditions!.push({ left: [], right: [] });
          }),
          'JOINS',
          index,
        );
      },
      [handleStructureChange, structure?.joins],
    );

    const handleDeleteJoinsItem = useCallback(
      index => {
        structure?.joins?.[index]?.conditions?.forEach((_, i) => {
          form.setFieldsValue({
            ['left' + index + i]: '',
            ['right' + index + i]: '',
          });
        });

        dispatch(
          actions.changeCurrentEditingView({
            script: produce(structure, draft => {
              draft.joins.splice(index, 1);
            }),
          }),
        );
      },
      [structure, dispatch, actions, form],
    );

    const handleInterimRunSql = useCallback(
      async (type?: 'MAIN' | 'JOINS', joinIndex?: number) => {
        try {
          let joins: JoinTableProps[] = [];

          if (joinIndex !== undefined) {
            joins = (structure?.joins || []).slice(0, joinIndex + 1);
          } else {
            joins = structure?.joins || [];
          }
          for (let j = 0; j < joins.length; j++) {
            const join = joins[j];
            if (!join.table || !join.table.length) {
              throw new Error('请选择表格');
            }
            if (type === 'JOINS' && join.conditions) {
              for (let i = 0; i < join.conditions.length; i++) {
                const condition = join.conditions[i];
                if (
                  !condition.left ||
                  !condition.left.length ||
                  !condition.right ||
                  !condition.right.length
                ) {
                  await form.validateFields();
                }
              }
            }
          }

          if (!type) {
            await form.validateFields();
          }
          let script: StructViewQueryProps = {
            table: [],
            columns: [],
            joins: [],
          };

          if (type === 'MAIN') {
            script.table = structure.table;
            script.columns = structure.columns;
          } else if (type === 'JOINS' && joinIndex !== undefined) {
            script.table = structure.table;
            script.columns = structure.columns;
            script.joins = [structure.joins[joinIndex]];
          } else {
            script = structure;
          }
          dispatch(runSql({ id, isFragment: !!type, script }));
        } catch (errorInfo: any) {
          errorInfo.message && message.error(errorInfo.message);
        }
      },
      [dispatch, id, structure, form],
    );

    const handleDeleteConditions = useCallback(
      (joinIndex, conditionsIndex) => {
        dispatch(
          actions.changeCurrentEditingView({
            script: produce(structure, draft => {
              draft.joins[joinIndex].conditions?.splice(conditionsIndex, 1);
            }),
          }),
        );
        form.setFieldsValue({
          ['left' + joinIndex + conditionsIndex]: '',
          ['right' + joinIndex + conditionsIndex]: '',
        });
      },
      [actions, dispatch, structure, form],
    );

    const save = useCallback(
      (resolve?) => {
        dispatch(saveView({ resolve }));
      },
      [dispatch],
    );

    const callSave = useCallback(() => {
      if (
        status !== ViewStatus.Archived &&
        stage === ViewViewModelStages.Saveable
      ) {
        if (isNewView(id)) {
          showSaveForm({
            type: CommonFormTypes.Edit,
            visible: true,
            parentIdLabel: t('file'),
            initialValues: {
              name: '',
              parentId: '',
              config: {},
            },
            onSave: (values, onClose) => {
              let index = getInsertedNodeIndex(values, viewsData);
              dispatch(
                actions.changeCurrentEditingView({
                  ...values,
                  parentId: values.parentId || null,
                  index,
                }),
              );
              save(onClose);
            },
          });
        } else {
          save();
        }
      }
    }, [
      dispatch,
      actions,
      stage,
      status,
      id,
      save,
      showSaveForm,
      viewsData,
      t,
    ]);

    useEffect(() => {
      initActions({ onRun: handleInterimRunSql, onSave: callSave });
    }, [initActions, callSave, handleInterimRunSql]);

    useEffect(() => {
      if (typeof structure === 'string') {
        dispatch(
          actions.initCurrentEditingStructViewScript({
            script: handleStringScriptToObject(
              structure,
              allDatabaseSchemas[sourceId],
            ),
          }),
        );
      }
    }, [sourceId, allDatabaseSchemas, actions, dispatch, structure]);

    useEffect(() => {
      structure?.joins?.forEach((join, index) => {
        join?.conditions?.forEach((condition, i) => {
          form.setFieldsValue({
            ['left' + index + i]: encodeJoinConditionValue(condition.left),
            ['right' + index + i]: encodeJoinConditionValue(condition.right),
          });
        });
      });
    }, [structure?.joins, form, encodeJoinConditionValue]);

    const stepItems = [
      { title: t('main') },
      ...(structure?.joins || []).map((_, index) => ({ title: `${t('join')} ${index + 1}` })),
    ];

    return (
      <Flex vertical style={{ flex: 1, minHeight: 0, background: token.colorBgContainer }}>
        {!structure || typeof structure === 'string' ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: 120 }}>
            <Spin />
          </Flex>
        ) : (
          <>
            <Toolbar
              type="STRUCT"
              allowManage={allowManage}
              allowEnableViz={allowEnableViz}
            />
            <Flex vertical gap={16} style={{ flex: 1, minHeight: 0, padding: 16, overflow: 'auto' }}>
              <Steps size="small" current={Math.max(stepItems.length - 1, 0)} items={stepItems} />
              <Form form={form} name="StructViewForm" layout="vertical">
                <Card size="small" title={t('main')} extra={
                  <Tooltip title={t('runStep')}>
                    <Button type="text" icon={<CaretRightOutlined />} onClick={() => allowManage && handleInterimRunSql('MAIN')} />
                  </Tooltip>
                }>
                  <SelectDataSource
                    type="MAIN"
                    sourceId={sourceId}
                    structure={structure}
                    allowManage={allowManage}
                    onChange={handleStructureChange}
                  />
                </Card>

                {(structure?.joins || []).map((join, i) => (
                  <Card
                    key={`join-${i}`}
                    size="small"
                    title={`${t('join')} ${i + 1}`}
                    style={{ marginTop: 12 }}
                    extra={
                      <Space>
                        <Tooltip title={t('runStep')}>
                          <Button type="text" icon={<CaretRightOutlined />} onClick={() => allowManage && handleInterimRunSql('JOINS', i)} />
                        </Tooltip>
                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => allowManage && handleDeleteJoinsItem(i)} />
                      </Space>
                    }
                  >
                    <Flex vertical gap={12}>
                      <Flex gap={8} align="center" wrap>
                        <SelectDataSource joinTable={join} structure={structure} allowManage={allowManage} renderType="READONLY" />
                        <SelectJoinType type={join.joinType!} onChange={type => allowManage && handleTableJoinType(type, i)} />
                        <SelectDataSource
                          type="JOINS"
                          joinTable={join}
                          sourceId={sourceId}
                          structure={structure}
                          allowManage={allowManage}
                          onChange={(table, type) => handleTableJoin(table, type, i)}
                        />
                      </Flex>
                      {join.table && (
                        <>
                          <Typography.Text type="secondary">{t('selectJoinColumn')}</Typography.Text>
                          <Flex vertical gap={8}>
                            {join.conditions?.map(({ left, right }, ind) => (
                              <Flex key={`condition-${i}-${ind}`} gap={8} align="center">
                                <SelectJoinColumns
                                  structure={structure}
                                  onChange={(columnName, type, joinConditionIndex) =>
                                    handleTableJoinColumns(columnName, type, i, joinConditionIndex)
                                  }
                                  conditionsIndex={ind}
                                  joinIndex={i}
                                  sourceId={sourceId}
                                  allowManage={allowManage}
                                />
                                <Space>
                                  {!!left?.length && !!right?.length && ind === (join.conditions?.length || 0) - 1 && (
                                    <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => allowManage && handleTableJoinAddColumns(i)} />
                                  )}
                                  {ind === (join.conditions?.length || 0) - 1 && ind > 0 && (
                                    <Button danger type="text" size="small" icon={<CloseOutlined />} onClick={() => allowManage && handleDeleteConditions(i, ind)} />
                                  )}
                                </Space>
                              </Flex>
                            ))}
                          </Flex>
                        </>
                      )}
                    </Flex>
                  </Card>
                ))}

                {!!structure?.table?.length && (
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      disabled={!!structure?.joins?.length && !structure.joins[structure.joins.length - 1]?.table}
                      icon={<PlusOutlined />}
                      onClick={allowManage ? handleAddTableJoin : undefined}
                    >
                      {t('addJoin')}
                    </Button>
                    <Button type="primary" icon={<CaretRightOutlined />} onClick={() => handleInterimRunSql()}>
                      {t('run')}
                    </Button>
                  </Space>
                )}
              </Form>
            </Flex>
          </>
        )}
      </Flex>
    );
  },
);

