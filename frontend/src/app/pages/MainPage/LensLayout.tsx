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
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  MenuProps,
  Tooltip,
  Space,
  Typography,
  theme,
} from 'antd';
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

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

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
  const { token } = theme.useToken();
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
            ? [
                {
                  path: `/organizations/${orgId}/sources`,
                  name: '数据源',
                  icon: <DatabaseOutlined />,
                },
              ]
            : []),
          ...(visible(ResourceTypes.View)
            ? [
                {
                  path: `/organizations/${orgId}/datasets`,
                  name: '数据集',
                  icon: <TableOutlined />,
                },
              ]
            : []),
        ],
      },
      {
        title: '分析',
        items: visible(ResourceTypes.Viz)
          ? [
              {
                path: `/organizations/${orgId}/charts`,
                name: '图表',
                icon: <BarChartOutlined />,
              },
              {
                path: `/organizations/${orgId}/dashboards`,
                name: '仪表板',
                icon: <AreaChartOutlined />,
              },
            ]
          : [],
      },
      {
        title: '任务',
        items: visible(ResourceTypes.Schedule)
          ? [
              {
                path: `/organizations/${orgId}/schedules`,
                name: '定时任务',
                icon: <CalendarOutlined />,
              },
            ]
          : [],
      },
      {
        title: '管理',
        items: [
          ...(visible(ResourceTypes.User)
            ? [
                {
                  path: `/organizations/${orgId}/members`,
                  name: '用户',
                  icon: <UserOutlined />,
                },
                {
                  path: `/organizations/${orgId}/roles`,
                  name: '角色',
                  icon: <TeamOutlined />,
                },
              ]
            : []),
          ...(visible(ResourceTypes.Manager)
            ? [
                {
                  path: `/organizations/${orgId}/permissions/subject`,
                  name: '权限',
                  icon: <SafetyCertificateOutlined />,
                },
              ]
            : []),
        ],
      },
      {
        title: '系统',
        items: visible(ResourceTypes.Manager)
          ? [
              {
                path: `/organizations/${orgId}/variables`,
                name: '变量',
                icon: <LockOutlined />,
              },
              {
                path: `/organizations/${orgId}/monitor`,
                name: '监控',
                icon: <MonitorOutlined />,
              },
              {
                path: `/organizations/${orgId}/auditLog`,
                name: '审计',
                icon: <AuditOutlined />,
              },
              {
                path: `/organizations/${orgId}/orgSettings`,
                name: '设置',
                icon: <SettingOutlined />,
              },
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

  const quickCreate: MenuProps = {
    items: [
      { key: 'source', label: '新建数据源', icon: <DatabaseOutlined /> },
      { key: 'dataset', label: '新建数据集', icon: <TableOutlined /> },
      { key: 'chart', label: '新建图表', icon: <BarChartOutlined /> },
      { key: 'dashboard', label: '新建仪表板', icon: <AreaChartOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === 'source') navigate(`/organizations/${orgId}/sources/new`);
      if (key === 'dataset') {
        navigate(`/organizations/${orgId}/datasets/new`);
      }
      if (key === 'chart') {
        navigate(
          `/organizations/${orgId}/charts/new?dataChartId=&chartType=dataChart&container=dataChart`,
        );
      }
      if (key === 'dashboard') {
        navigate(`/organizations/${orgId}/dashboards/new`);
      }
    },
  };

  const accountMenu: MenuProps = {
    items: [
      { key: 'profile', label: '个人资料', icon: <UserOutlined /> },
      { key: 'password', label: '修改密码', icon: <LockOutlined /> },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') setProfileVisible(true);
      if (key === 'password') setPasswordVisible(true);
      if (key === 'logout') {
        dispatch(logout(() => navigate('/login', { replace: true })) as any);
      }
    },
  };

  return (
    <LensRoot>
      <LensSider
        width={216}
        collapsedWidth={64}
        collapsed={collapsed}
        theme="light"
      >
        <BrandBlock $collapsed={collapsed}>
          <BrandMark>DS</BrandMark>
          {!collapsed && (
            <BrandCopy>
              <strong>DataSphere Lens</strong>
              <span>Business Intelligence</span>
            </BrandCopy>
          )}
        </BrandBlock>

        {!collapsed && (
          <WorkspaceCard>
            <span>当前空间</span>
            <strong title={organization?.name || '默认组织'}>
              {organization?.name || '默认组织'}
            </strong>
          </WorkspaceCard>
        )}

        <Navigation aria-label="DataSphere Lens navigation">
          {navGroups.map(group =>
            group.items.length ? (
              <NavGroup key={group.title}>
                {!collapsed && <NavGroupLabel>{group.title}</NavGroupLabel>}
                <NavItems>
                  {group.items.map(item => {
                    const selected = activeItem?.path === item.path;
                    const content = (
                      <NavButton
                        key={item.path}
                        type="button"
                        $selected={selected}
                        $collapsed={collapsed}
                        onClick={() => navigate(item.path)}
                      >
                        <NavIcon $selected={selected}>{item.icon}</NavIcon>
                        {!collapsed && <span>{item.name}</span>}
                      </NavButton>
                    );
                    return collapsed ? (
                      <Tooltip key={item.path} title={item.name} placement="right">
                        {content}
                      </Tooltip>
                    ) : (
                      content
                    );
                  })}
                </NavItems>
              </NavGroup>
            ) : null,
          )}
        </Navigation>

        <CollapseButton
          type="button"
          $collapsed={collapsed}
          onClick={() => setCollapsed(value => !value)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span>收起导航</span>}
        </CollapseButton>
      </LensSider>

      <LensMain>
        <LensHeader>
          <Space size={10} align="center">
            <Title level={5} style={{ margin: 0 }}>
              {activeItem?.name || 'DataSphere Lens'}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {organization?.name || '默认组织'}
            </Text>
          </Space>
          <Space size={8}>
            <Dropdown menu={quickCreate} trigger={['click']}>
              <Button type="primary" size="small" icon={<PlusOutlined />}>
                新建
              </Button>
            </Dropdown>
            <Dropdown menu={accountMenu} trigger={['click']}>
              <Button type="text" style={{ height: 36, paddingInline: 6 }}>
                <Space size={6}>
                  <Avatar
                    size={26}
                    src={
                      user?.avatar
                        ? `${BASE_RESOURCE_URL}${user.avatar}`
                        : undefined
                    }
                    icon={<UserOutlined />}
                  />
                  <Text>{user?.name || user?.username || '用户'}</Text>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </LensHeader>
        <LensContent>{children}</LensContent>
      </LensMain>

      <Profile
        visible={profileVisible}
        onCancel={() => setProfileVisible(false)}
      />
      <ModifyPassword
        visible={passwordVisible}
        onCancel={() => setPasswordVisible(false)}
      />
    </LensRoot>
  );
}


const LensRoot = styled(Layout)`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: ${p => p.theme.bodyBackground};
`;

const LensSider = styled(Sider)`
  position: relative !important;
  z-index: 20;
  height: 100vh;
  overflow: hidden;
  background: ${p => p.theme.componentBackground} !important;
  border-right: 1px solid ${p => p.theme.borderColorSplit};
`;

const BrandBlock = styled.div<{ $collapsed: boolean }>`
  display: flex;
  gap: 10px;
  align-items: center;
  height: 58px;
  padding: 0 ${p => (p.$collapsed ? '16px' : '14px')};
`;

const BrandMark = styled.div`
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  width: 32px;
  height: 32px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.04em;
  background: linear-gradient(145deg, #265d97, #3b78b7);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(38 93 151 / 20%);
`;

const BrandCopy = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    overflow: hidden;
    font-size: 13px;
    font-weight: 650;
    color: ${p => p.theme.textColor};
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  span {
    margin-top: 1px;
    font-size: 10px;
    color: ${p => p.theme.textColorDisabled};
  }
`;

const WorkspaceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 10px;
  margin: 0 10px 10px;
  background: ${p => p.theme.bodyBackground};
  border: 1px solid ${p => p.theme.borderColorSplit};
  border-radius: 8px;

  span {
    font-size: 10px;
    color: ${p => p.theme.textColorDisabled};
  }

  strong {
    overflow: hidden;
    font-size: 12px;
    font-weight: 550;
    color: ${p => p.theme.textColorSnd};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Navigation = styled.nav`
  height: calc(100vh - 126px);
  padding: 0 8px 52px;
  overflow-y: auto;
  scrollbar-width: thin;
`;

const NavGroup = styled.section`
  margin-bottom: 7px;
`;

const NavGroupLabel = styled.div`
  padding: 7px 10px 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${p => p.theme.textColorDisabled};
  letter-spacing: 0.08em;
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavButton = styled.button<{ $selected: boolean; $collapsed: boolean }>`
  position: relative;
  display: flex;
  gap: 9px;
  align-items: center;
  justify-content: ${p => (p.$collapsed ? 'center' : 'flex-start')};
  width: 100%;
  height: 36px;
  padding: ${p => (p.$collapsed ? '0' : '0 10px')};
  font: inherit;
  font-size: 12px;
  font-weight: ${p => (p.$selected ? 600 : 450)};
  color: ${p => (p.$selected ? p.theme.primary : p.theme.textColorSnd)};
  cursor: pointer;
  background: ${p => (p.$selected ? p.theme.emphasisBackground : 'transparent')};
  border: 0;
  border-radius: 7px;
  transition: background 120ms ease, color 120ms ease;

  &::before {
    position: absolute;
    top: 8px;
    left: 0;
    width: 2px;
    height: 20px;
    content: '';
    background: ${p => (p.$selected ? p.theme.primary : 'transparent')};
    border-radius: 0 2px 2px 0;
  }

  &:hover {
    color: ${p => p.theme.primary};
    background: ${p => p.theme.bodyBackground};
  }
`;

const NavIcon = styled.span<{ $selected: boolean }>`
  display: grid;
  flex: 0 0 24px;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
  color: ${p => (p.$selected ? p.theme.primary : p.theme.textColorDisabled)};
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: ${p => (p.$collapsed ? 'center' : 'flex-start')};
  height: 34px;
  padding: ${p => (p.$collapsed ? '0' : '0 10px')};
  font: inherit;
  font-size: 11px;
  color: ${p => p.theme.textColorDisabled};
  cursor: pointer;
  background: ${p => p.theme.componentBackground};
  border: 0;
  border-radius: 7px;

  &:hover {
    color: ${p => p.theme.textColorSnd};
    background: ${p => p.theme.bodyBackground};
  }
`;

const LensMain = styled(Layout)`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const LensHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  line-height: normal;
  background: ${p => p.theme.componentBackground};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};
`;

const LensContent = styled(Content)`
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: ${p => p.theme.bodyBackground};
`;
