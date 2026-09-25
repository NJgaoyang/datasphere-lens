/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import { PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Skeleton } from 'antd';
import {
  LensPanelBody,
  LensPanelHeader,
  LensSearch,
  LensToolbar,
} from 'app/components/LensWorkspace';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { FC, memo, ReactElement, ReactNode } from 'react';
import styled from 'styled-components';

type AddAction = {
  items: Array<{ key: string; text: string }>;
  icon?: ReactElement;
  callback: (info: { key: string }) => void;
};

interface ContainerProps {
  title: string;
  loading?: boolean;
  search?: boolean;
  add?: AddAction;
  onSearch?: (event: any) => void;
  children?: ReactNode;
}

const Container: FC<ContainerProps> = memo(props => {
  const t = useI18NPrefix('view.properties');
  const { title, children, loading, search, add, onSearch } = props;
  const addAction = add ? (
    <Dropdown
      trigger={['click']}
      menu={{
        items: add.items.map(item => ({ key: item.key, label: item.text })),
        onClick: info => add.callback({ key: String(info.key) }),
      }}
    >
      <Button
        type="text"
        size="small"
        icon={add.icon || <PlusOutlined />}
      />
    </Dropdown>
  ) : undefined;

  return (
    <StyledContainer>
      <LensPanelHeader title={t(title)} action={addAction} />
      {search ? (
        <LensToolbar>
          <LensSearch
            allowClear
            size="small"
            placeholder={`搜索${t(title)}`}
            onChange={onSearch}
          />
        </LensToolbar>
      ) : null}
      <LensPanelBody>
        <Skeleton active loading={loading}>
          {children}
        </Skeleton>
      </LensPanelBody>
    </StyledContainer>
  );
});

export default Container;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
`;
