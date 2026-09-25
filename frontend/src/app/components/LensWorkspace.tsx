import {
  Button,
  ButtonProps,
  Empty,
  Input,
  Spin,
  Tree as AntTree,
  TreeProps,
} from 'antd';
import { MutableRefObject, ReactNode } from 'react';
import styled from 'styled-components';

export const LensPanel = styled.aside<{
  $width?: number;
  $edge?: 'left' | 'right' | 'none';
}>`
  display: flex;
  flex: 0 0 ${p => (p.$width ? `${p.$width}px` : 'auto')};
  flex-direction: column;
  width: ${p => (p.$width ? `${p.$width}px` : '100%')};
  min-width: 0;
  min-height: 0;
  background: ${p => p.theme.componentBackground};
  border-right: ${p =>
    p.$edge === 'right' ? `1px solid ${p.theme.borderColorSplit}` : 'none'};
  border-left: ${p =>
    p.$edge === 'left' ? `1px solid ${p.theme.borderColorSplit}` : 'none'};
`;

export function LensPanelHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Header>
      <HeaderText>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </HeaderText>
      {action ? <HeaderAction>{action}</HeaderAction> : null}
    </Header>
  );
}

export const LensPanelBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: auto;
`;

export const LensPane = styled.div<{ $active: boolean }>`
  display: ${p => (p.$active ? 'flex' : 'none')};
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
`;

export const LensSearch = styled(Input.Search)`
  .ant-input-affix-wrapper,
  .ant-input-group-addon .ant-btn {
    border-radius: 6px;
  }
`;

export const LensToolbar = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  background: ${p => p.theme.componentBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

export interface LensTreeProps extends TreeProps {
  loading?: boolean;
  wrapperRef?: MutableRefObject<HTMLDivElement> | null;
  emptyText?: ReactNode;
}

export function LensTree({
  loading = false,
  wrapperRef,
  treeData,
  emptyText = '暂无数据',
  ...props
}: LensTreeProps) {
  return (
    <LensTreeFrame ref={wrapperRef || undefined}>
      {loading ? (
        <TreeState><Spin size="small" /></TreeState>
      ) : treeData?.length ? (
        <StyledLensTree>
          <AntTree blockNode treeData={treeData} {...props} />
        </StyledLensTree>
      ) : (
        <TreeState>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
        </TreeState>
      )}
    </LensTreeFrame>
  );
}

const LensTreeFrame = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
`;

const TreeState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
`;

const StyledLensTree = styled.div`
  padding: 4px;

  .ant-tree {
    background: transparent;
  }

  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    min-height: 30px;
    padding: 1px 0;
  }

  .ant-tree-switcher {
    line-height: 30px;
    color: ${p => p.theme.textColorDisabled};
  }

  .ant-tree-node-content-wrapper {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    min-height: 28px;
    padding: 0 6px;
    line-height: 28px;
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

  .check-list & {
    min-width: 220px;
    max-height: 320px;
    overflow: auto;
  }

  .without-indent & .ant-tree-indent-unit {
    width: 10px;
  }
`;

export interface LensToolButtonProps extends Omit<ButtonProps, 'color'> {
  fontSize?: number;
  iconSize?: number;
  color?: string;
  active?: boolean;
}

export function LensToolButton({
  fontSize = 12,
  iconSize = 14,
  color,
  active = false,
  ...props
}: LensToolButtonProps) {
  return (
    <StyledToolButton
      type="text"
      size="small"
      $fontSize={fontSize}
      $iconSize={iconSize}
      $color={color}
      $active={active}
      {...props}
    />
  );
}

const StyledToolButton = styled(Button)<{
  $fontSize: number;
  $iconSize: number;
  $color?: string;
  $active: boolean;
}>`
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  font-size: ${p => p.$fontSize}px;
  color: ${p =>
    p.$color || (p.$active ? p.theme.primary : p.theme.textColorSnd)};
  background: ${p => (p.$active ? p.theme.emphasisBackground : 'transparent')};
  border-radius: 6px;

  &:hover,
  &:focus {
    color: ${p => p.$color || p.theme.primary} !important;
    background: ${p => p.theme.bodyBackground} !important;
  }

  &:active {
    background: ${p => p.theme.emphasisBackground} !important;
  }

  .anticon {
    font-size: ${p => p.$iconSize}px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 7px 12px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  strong {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: ${p => p.theme.textColor};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    font-size: 11px;
    color: ${p => p.theme.textColorDisabled};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const HeaderAction = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
`;
