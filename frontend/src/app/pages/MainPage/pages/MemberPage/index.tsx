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

import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import { useMatch } from 'react-router-dom';
import styled from 'styled-components';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { RoleDetailPage } from './pages/RoleDetailPage';
import { Sidebar } from './Sidebar';
import { useMemberSlice } from './slice';

export function MemberPage() {
  useMemberSlice();
  const memberMatch = useMatch('/organizations/:orgId/members/:memberId');
  const roleMatch = useMatch('/organizations/:orgId/roles/:roleId');
  const memberRootMatch = useMatch('/organizations/:orgId/members');
  const roleRootMatch = useMatch('/organizations/:orgId/roles');

  return (
    <Container>
      <Sidebar />
      {memberMatch && <MemberDetailPage />}
      {roleMatch && <RoleDetailPage />}
      {!memberMatch && !roleMatch && (
        <EmptyState>
          <Empty
            image={
              memberRootMatch ? (
                <UserOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
              ) : (
                <TeamOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
              )
            }
            description={
              memberRootMatch
                ? '从左侧选择用户查看详情和角色关系'
                : roleRootMatch
                  ? '从左侧选择角色查看成员和权限'
                  : '请选择要管理的对象'
            }
          />
        </EmptyState>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  background: ${p => p.theme.bodyBackground};
`;
