import {
  AreaChartOutlined,
  AuditOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MonitorOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Tooltip } from 'antd';
import { selectLoggedInUser } from 'app/slice/selectors';
import { logout } from 'app/slice/thunks';
import { BASE_RESOURCE_URL } from 'globalConstants';
import React, { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ModifyPassword } from './Navbar/ModifyPassword';
import { Profile } from './Navbar/Profile';
import { ResourceTypes } from './pages/PermissionPage/constants';
import {
  selectCurrentOrganization,
  selectHideInNav,
} from './slice/selectors';

type NavItem = {
  path: string;
  name: string;
  icon: ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function LensLayout({
  children,
  orgId,
}: PropsWithChildren<{ orgId: string }>) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const organization = useSelector(selectCurrentOrganization);
  const hideInNav = useSelector(selectHideInNav);
  const [collapsed, setCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const visible = (module: ResourceTypes) => !hideInNav.includes(module);

  const navGroups = useMemo<NavGroup[]>(
    () => [
      {
        title: '工作区',
        items: [
          {
            path: `/organizations/${orgId}/home`,
            name: '首页',
            icon: <HomeOutlined />,
          },
        ],
      },
      {
        title: '数据',
        items: [
          ...(visible(ResourceTypes.Source)
            ? [{ path: `/organizations/${orgId}/sources`, name: '数据源', icon: <DatabaseOutlined /> }]
            : []),
          ...(visible(ResourceTypes.View)
            ? [{ path: `/organizations/${orgId}/views`, name: '数据集', icon: <TableOutlined /> }]
            : []),
        ],
      },
      {
        title: '分析',
        items: visible(ResourceTypes.Viz)
          ? [{ path: `/organizations/${orgId}/vizs`, name: '分析资产', icon: <BarChartOutlined /> }]
          : [],
      },
      {
        title: '协作',
        items: [
          ...(visible(ResourceTypes.Schedule)
            ? [{ path: `/organizations/${orgId}/schedules`, name: '定时任务', icon: <CalendarOutlined /> }]
            : []),
          ...(visible(ResourceTypes.User)
            ? [
                { path: `/organizations/${orgId}/members`, name: '用户', icon: <UserOutlined /> },
                { path: `/organizations/${orgId}/roles`, name: '角色', icon: <TeamOutlined /> },
              ]
            : []),
          ...(visible(ResourceTypes.Manager)
            ? [{ path: `/organizations/${orgId}/permissions/subject`, name: '权限', icon: <SafetyCertificateOutlined /> }]
            : []),
        ],
      },
      {
        title: '系统',
        items: visible(ResourceTypes.Manager)
          ? [
              { path: `/organizations/${orgId}/variables`, name: '变量', icon: <LockOutlined /> },
              { path: `/organizations/${orgId}/monitor`, name: '监控', icon: <MonitorOutlined /> },
              { path: `/organizations/${orgId}/auditLog`, name: '审计', icon: <AuditOutlined /> },
              { path: `/organizations/${orgId}/orgSettings`, name: '设置', icon: <SettingOutlined /> },
            ]
          : [],
      },
    ],
    [hideInNav, orgId],
  );
  const activeItem = navGroups
    .flatMap(group => group.items)
    .filter(item => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const quickCreate = {
    items: [
      { key: 'source', label: '新建数据源', icon: <DatabaseOutlined /> },
      { key: 'dataset', label: '新建数据集', icon: <TableOutlined /> },
      { key: 'chart', label: '新建图表', icon: <BarChartOutlined /> },
      { key: 'dashboard', label: '新建仪表板', icon: <AreaChartOutlined /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'source') navigate(`/organizations/${orgId}/sources/add`);
      if (key === 'dataset') navigate(`/organizations/${orgId}/views`);
      if (key === 'chart') {
        navigate(`/organizations/${orgId}/vizs/chartEditor?dataChartId=&chartType=dataChart&container=dataChart`);
      }
      if (key === 'dashboard') navigate(`/organizations/${orgId}/vizs`);
    },
  };

  const accountMenu = {
    items: [
      { key: 'profile', label: '个人资料', icon: <UserOutlined /> },
      { key: 'password', label: '修改密码', icon: <LockOutlined /> },
      { type: 'divider' as const },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'profile') setProfileVisible(true);
      if (key === 'password') setPasswordVisible(true);
      if (key === 'logout') {
        dispatch(logout(() => navigate('/login', { replace: true })) as any);
      }
    },
  };

  return (
    <Shell>
      <Sider className={collapsed ? 'collapsed' : ''}>
        <BrandRow>
          <BrandMark>DS</BrandMark>
          {!collapsed && (
            <BrandText>
              <strong>DataSphere</strong>
              <span>Lens</span>
            </BrandText>
          )}
        </BrandRow>

        {!collapsed && (
          <WorkspaceCard>
            <span>当前空间</span>
            <strong>{organization?.name || '默认组织'}</strong>
          </WorkspaceCard>
        )}

        <NavScroll>
          {navGroups.map(group =>
            group.items.length ? (
              <NavGroupBlock key={group.title}>
                {!collapsed && <NavGroupTitle>{group.title}</NavGroupTitle>}
                {group.items.map(item => {
                  const active = activeItem?.path === item.path;
                  const button = (
                    <NavButton
                      key={item.path}
                      className={active ? 'active' : ''}
                      onClick={() => navigate(item.path)}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      {!collapsed && <span>{item.name}</span>}
                    </NavButton>
                  );
                  return collapsed ? (
                    <Tooltip key={item.path} title={item.name} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
              </NavGroupBlock>
            ) : null,
          )}
        </NavScroll>

        <CollapseButton onClick={() => setCollapsed(value => !value)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span>收起导航</span>}
        </CollapseButton>
      </Sider>
      <WorkArea>
        <Topbar>
          <PageContext>
            <PageKicker>{organization?.name || '默认组织'}</PageKicker>
            <PageTitle>{activeItem?.name || 'DataSphere Lens'}</PageTitle>
          </PageContext>
          <TopActions>
            <Dropdown menu={quickCreate} trigger={['click']}>
              <Button type="primary" icon={<PlusOutlined />}>
                新建
              </Button>
            </Dropdown>
            <Dropdown menu={accountMenu} trigger={['click']}>
              <AccountButton>
                <Avatar
                  size={30}
                  src={user?.avatar ? `${BASE_RESOURCE_URL}${user.avatar}` : undefined}
                  icon={<UserOutlined />}
                />
                <span>{user?.name || user?.username || '用户'}</span>
              </AccountButton>
            </Dropdown>
          </TopActions>
        </Topbar>
        <Content>{children}</Content>
      </WorkArea>

      <Profile visible={profileVisible} onCancel={() => setProfileVisible(false)} />
      <ModifyPassword
        visible={passwordVisible}
        onCancel={() => setPasswordVisible(false)}
      />
    </Shell>
  );
}
const Shell = styled.div`
  display: flex;
  width: 100vw;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
  background: #f4f6f9;
`;

const Sider = styled.aside`
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: 224px;
  min-width: 224px;
  height: 100%;
  color: #dbe5f3;
  background: #0b1220;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition: width 0.2s ease, min-width 0.2s ease;

  &.collapsed {
    width: 72px;
    min-width: 72px;
  }
`;

const BrandRow = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 11px;
  align-items: center;
  height: 68px;
  padding: 0 20px;
`;
const BrandMark = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.4px;
  background: linear-gradient(135deg, #3b82f6 0%, #6d5dfc 100%);
  border-radius: 11px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.28);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    font-size: 14px;
    line-height: 17px;
    color: #fff;
  }

  span {
    font-size: 11px;
    line-height: 15px;
    color: #7f8da3;
  }
`;

const WorkspaceCard = styled.div`
  padding: 11px 12px;
  margin: 0 14px 12px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  span {
    display: block;
    margin-bottom: 3px;
    font-size: 10px;
    color: #66758b;
  }

  strong {
    display: block;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: #dce6f4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const NavScroll = styled.div`
  flex: 1;
  min-height: 0;
  padding: 2px 10px 14px;
  overflow: auto;
`;

const NavGroupBlock = styled.div`
  margin-bottom: 14px;
`;

const NavGroupTitle = styled.div`
  padding: 0 10px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #536177;
  letter-spacing: 0.08em;
`;

const NavButton = styled.button`
  display: flex;
  gap: 11px;
  align-items: center;
  width: 100%;
  height: 38px;
  padding: 0 10px;
  margin: 2px 0;
  font: inherit;
  font-size: 13px;
  color: #8f9db1;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;

  &:hover {
    color: #ecf4ff;
    background: rgba(255, 255, 255, 0.055);
  }

  &.active {
    color: #fff;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.24), rgba(109, 93, 252, 0.12));
    box-shadow: inset 2px 0 #5b8cff;
  }

  .collapsed & {
    justify-content: center;
    padding: 0;
  }
`;

const NavIcon = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 20px;
  font-size: 16px;
`;
const CollapseButton = styled.button`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 46px;
  font: inherit;
  font-size: 12px;
  color: #69788d;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  &:hover {
    color: #cbd7e8;
  }
`;

const WorkArea = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const Topbar = styled.header`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e8ebf0;
`;

const PageContext = styled.div`
  min-width: 0;
`;
const PageKicker = styled.div`
  margin-bottom: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #98a2b3;
  letter-spacing: 0.04em;
`;

const PageTitle = styled.div`
  overflow: hidden;
  font-size: 16px;
  font-weight: 650;
  color: #182230;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TopActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const AccountButton = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 38px;
  padding: 0 9px;
  font-size: 12px;
  color: #344054;
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background: #f4f6f9;
  }
`;

const Content = styled.main`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #f4f6f9;
`;
