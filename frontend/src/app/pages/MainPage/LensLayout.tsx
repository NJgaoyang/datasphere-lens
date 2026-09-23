import {
  AreaChartOutlined,
  AuditOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  MonitorOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Dropdown, Space, Tag } from 'antd';
import { selectLoggedInUser } from 'app/slice/selectors';
import { logout } from 'app/slice/thunks';
import { BASE_RESOURCE_URL } from 'globalConstants';
import React, { PropsWithChildren, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  selectCurrentOrganization,
  selectHideInNav,
} from './slice/selectors';
import { ResourceTypes } from './pages/PermissionPage/constants';
import { Profile } from './Navbar/Profile';
import { ModifyPassword } from './Navbar/ModifyPassword';

export function LensLayout({ children, orgId }: PropsWithChildren<{ orgId: string }>) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const organization = useSelector(selectCurrentOrganization);
  const hideInNav = useSelector(selectHideInNav);
  const [profileVisible, setProfileVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const visible = (module: ResourceTypes) => !hideInNav.includes(module);
  const routes = useMemo(() => [
    { path: `/organizations/${orgId}/home`, name: '首页', icon: <HomeOutlined /> },
    {
      name: '数据准备', icon: <DatabaseOutlined />,
      routes: [
        ...(visible(ResourceTypes.Source) ? [{ path: `/organizations/${orgId}/sources`, name: '数据源', icon: <DatabaseOutlined /> }] : []),
        ...(visible(ResourceTypes.View) ? [{ path: `/organizations/${orgId}/views`, name: '数据集', icon: <TableOutlined /> }] : []),
      ],
    },
    {
      name: '数据分析', icon: <AreaChartOutlined />,
      routes: visible(ResourceTypes.Viz) ? [
        { path: `/organizations/${orgId}/vizs`, name: '图表与仪表板', icon: <BarChartOutlined /> },
      ] : [],
    },
    {
      name: '任务中心', icon: <CalendarOutlined />,
      routes: visible(ResourceTypes.Schedule) ? [
        { path: `/organizations/${orgId}/schedules`, name: '定时任务', icon: <CalendarOutlined /> },
      ] : [],
    },
    {
      name: '组织权限', icon: <TeamOutlined />,
      routes: [
        ...(visible(ResourceTypes.User) ? [
          { path: `/organizations/${orgId}/members`, name: '用户管理', icon: <UserOutlined /> },
          { path: `/organizations/${orgId}/roles`, name: '角色管理', icon: <TeamOutlined /> },
        ] : []),
        ...(visible(ResourceTypes.Manager) ? [{ path: `/organizations/${orgId}/permissions/subject`, name: '权限管理', icon: <SafetyCertificateOutlined /> }] : []),
      ],
    },
    {
      name: '系统管理', icon: <SettingOutlined />,
      routes: visible(ResourceTypes.Manager) ? [
        { path: `/organizations/${orgId}/variables`, name: '系统变量', icon: <LockOutlined /> },
        { path: `/organizations/${orgId}/monitor`, name: '系统监控', icon: <MonitorOutlined /> },
        { path: `/organizations/${orgId}/auditLog`, name: '审计日志', icon: <AuditOutlined /> },
        { path: `/organizations/${orgId}/orgSettings`, name: '系统设置', icon: <SettingOutlined /> },
      ] : [],
    },
  ], [hideInNav, orgId]);

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
      if (key === 'logout') dispatch(logout(() => navigate('/login', { replace: true })) as any);
    },
  };

  return (
    <>
      <ProLayout
        title="DataSphere Lens"
        logo={<div style={{ width: 32, height: 32, borderRadius: 9, background: '#1677ff', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>L</div>}
        layout="side"
        fixedHeader
        fixSiderbar
        siderWidth={220}
        route={{ path: '/', routes }}
        location={{ pathname: location.pathname }}
        menuItemRender={(item, dom) => item.path ? <div onClick={() => navigate(item.path!)}>{dom}</div> : dom}
        actionsRender={() => [
          <Tag key="org" bordered={false}>{organization?.name || '当前组织'}</Tag>,
          <Dropdown key="account" menu={accountMenu} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size="small" src={user?.avatar ? `${BASE_RESOURCE_URL}${user.avatar}` : undefined} icon={<UserOutlined />} />
              <span>{user?.name || user?.username || '用户'}</span>
            </Space>
          </Dropdown>,
        ]}
        contentStyle={{ margin: 0, padding: 0, height: 'calc(100vh - 56px)', overflow: 'hidden', background: '#f5f7fa' }}
        token={{
          header: { colorBgHeader: '#ffffff', colorHeaderTitle: '#1f2329' },
          sider: { colorMenuBackground: '#ffffff', colorTextMenu: '#4e5969', colorTextMenuSelected: '#1677ff', colorBgMenuItemSelected: '#eaf3ff' },
        }}
      >
        <div style={{ height: '100%', minWidth: 0, display: 'flex', overflow: 'hidden' }}>{children}</div>
      </ProLayout>
      <Profile visible={profileVisible} onCancel={() => setProfileVisible(false)} />
      <ModifyPassword visible={passwordVisible} onCancel={() => setPasswordVisible(false)} />
    </>
  );
}
