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
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldStringOutlined,
  FileUnknownOutlined,
  MoreOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { Menu, Popconfirm, Popover, Tooltip } from 'antd';
import { LensIconBox } from 'app/components/LensWorkspace';
import { DataViewFieldType } from 'app/constants';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { ChartDataViewMeta } from 'app/types/ChartDataViewMeta';
import { FC, memo } from 'react';
import styled from 'styled-components';
import { getFieldDisplayName } from 'utils/utils';
import {
  FONT_SIZE_BASE,
  FONT_SIZE_TITLE,
  SPACE,
  SPACE_MD,
  SPACE_TIMES,
  SPACE_XS,
  WARNING,
} from 'styles/StyleConstants';

const DataModelComputerFieldNode: FC<{
  node: ChartDataViewMeta;
  menuClick: (node: ChartDataViewMeta, key: string) => void;
}> = memo(({ node, menuClick }) => {
  const t = useI18NPrefix('view.model');

  const renderNode = (node: ChartDataViewMeta) => {
    let icon;
    switch (node.type) {
      case DataViewFieldType.NUMERIC:
        icon = (
          <NumberOutlined style={{ alignSelf: 'center', color: WARNING }} />
        );
        break;
      case DataViewFieldType.STRING:
        icon = (
          <FieldStringOutlined
            style={{ alignSelf: 'center', color: WARNING }}
          />
        );
        break;
      case DataViewFieldType.DATE:
      case DataViewFieldType.DATETIME:
        icon = (
          <CalendarOutlined style={{ alignSelf: 'center', color: WARNING }} />
        );
        break;
      default:
        icon = (
          <FileUnknownOutlined
            style={{ alignSelf: 'center', color: WARNING }}
          />
        );
        break;
    }

    return (
      <>
        <div className="content">
          <Tooltip title={t('createComputedFields')} placement="left">
            <StyledIW fontSize={FONT_SIZE_TITLE}>{icon}</StyledIW>
          </Tooltip>
          <span>{getFieldDisplayName(node)}</span>
        </div>
        <div className="action">
          <Popover
            trigger={['click']}
            placement="bottom"
            content={
              <Menu
                prefixCls="ant-dropdown-menu"
                selectable={false}
                onClick={({ key }) => menuClick(node, key)}
              >
                <Menu.Item
                  key="exit"
                  icon={<EditOutlined className="icon" />}
                >
                  {t('edit')}
                </Menu.Item>
                <Menu.Item
                  key="del"
                  icon={<DeleteOutlined className="icon" />}
                >
                  <Popconfirm
                    title={t('deleteSure')}
                    onConfirm={() => menuClick(node, 'delete')}
                  >
                    {t('delete')}
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined />
          </Popover>
        </div>
      </>
    );
  };

  return (
    <StyledDataModelComputerFieldNode>
      {renderNode(node)}
    </StyledDataModelComputerFieldNode>
  );
});

export default DataModelComputerFieldNode;

const StyledDataModelComputerFieldNode = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  padding: 0 ${SPACE_MD};
  margin: ${SPACE} 0;
  font-size: ${FONT_SIZE_BASE};
  line-height: 32px;
  user-select: 'none';
  background: 'transparent';
  &.in-hierarchy {
    margin-right: 0;
  }

  & .content {
    display: flex;
    align-items: center;
    min-width: 0;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  & .action {
    display: none;
    flex-shrink: 0;
    padding-right: ${SPACE_XS};
    margin-left: auto;
  }
  &:hover {
    .action {
      display: inline-block;
    }
  }
`;

const StyledIW = styled(LensIconBox)`
  width: ${SPACE_TIMES(7)};
  height: ${SPACE_TIMES(7)};
  margin-right: ${SPACE_XS};
  cursor: pointer;
  border: 1px solid ${p => p.theme.borderColorSplit};
  border-radius: 4px;
`;
