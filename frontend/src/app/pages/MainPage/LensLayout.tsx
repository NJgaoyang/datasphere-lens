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
  Menu,
  MenuProps,
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

  const menuItems: MenuProps['items'] = navGroups.flatMap((group, groupIndex) => {
    const items: MenuProps['items'] = group.items.map(item => ({
      key: item.path,
      icon: item.icon,
      label: item.name,
      onClick: () => navigate(item.path),
    }));
    if (!items.length) return [];
    return [
      {
        type: 'group' as const,
        key: `group-${groupIndex}`,
        label: collapsed ? undefined : group.title,
        children: items,
      },
    ];
  });

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
    <Layout style={{ width: '100%', height: '100vh', overflow: 'hidden', background: token.colorBgLayout }}>
      <Sider
        width={208}
        collapsedWidth={60}
        collapsed={collapsed}
        theme="light"
        style={{
          position: 'relative',
          zIndex: 20,
          height: '100vh',
          overflow: 'hidden',
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Space
          size={9}
          align="center"
          style={{ height: 56, padding: collapsed ? '0 16px' : '0 16px' }}
        >
          <Avatar
            shape="square"
            size={28}
            style={{ background: token.colorPrimary, fontWeight: 700, fontSize: 11 }}
          >
            DS
          </Avatar>
          {!collapsed && (
            <div style={{ lineHeight: 1.2 }}>
              <Text strong style={{ display: 'block', color: token.colorText }}>
                DataSphere Lens
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                Business Intelligence
              </Text>
            </div>
          )}
        </Space>

        {!collapsed && (
          <div
            style={{
              margin: '0 10px 8px',
              padding: '8px 10px',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusSM,
              background: token.colorFillAlter,
            }}
          >
            <Text type="secondary" style={{ display: 'block', fontSize: 10 }}>
              当前空间
            </Text>
            <Text strong ellipsis style={{ display: 'block', marginTop: 2 }}>
              {organization?.name || '默认组织'}
            </Text>
          </div>
        )}

        <Menu
          mode="inline"
          theme="light"
          selectedKeys={activeItem ? [activeItem.path] : []}
          items={menuItems}
          inlineCollapsed={collapsed}
          style={{
            height: 'calc(100vh - 120px)',
            overflowY: 'auto',
            borderInlineEnd: 0,
            background: 'transparent',
          }}
        />

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(value => !value)}
          style={{
            position: 'absolute',
            right: collapsed ? 10 : 8,
            bottom: 8,
            left: collapsed ? 10 : 8,
            color: token.colorTextSecondary,
          }}
        >
          {!collapsed && '收起导航'}
        </Button>
      </Sider>

      <Layout style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 52,
            padding: '0 16px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
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
        </Header>
        <Content style={{ minWidth: 0, minHeight: 0, overflow: 'auto', background: token.colorBgLayout }}>{children}</Content>
      </Layout>

      <Profile
        visible={profileVisible}
        onCancel={() => setProfileVisible(false)}
      />
      <ModifyPassword
        visible={passwordVisible}
        onCancel={() => setPasswordVisible(false)}
      />
    </Layout>
  );
}
