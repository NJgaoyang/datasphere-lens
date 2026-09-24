import {
  CloseOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Modal, Space, Tabs as AntTabs, theme } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ViewViewModelStages } from '../constants';
import { EditorContext } from '../EditorContext';
import {
  selectCurrentEditingViewAttr,
  selectEditingViews,
} from '../slice/selectors';
import {
  closeAllEditingViews,
  closeOtherEditingViews,
  removeEditingView,
  runSql,
} from '../slice/thunks';
import { ViewViewModel } from '../slice/types';

export const Tabs = memo(() => {
  const { token } = theme.useToken();
  const [operatingView, setOperatingView] = useState<null | ViewViewModel>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { editorInstance } = useContext(EditorContext);
  const orgId = useSelector(selectOrgId);
  const editingViews = useSelector(selectEditingViews);
  const id = useSelector(state =>
    selectCurrentEditingViewAttr(state, { name: 'id' }),
  ) as string;
  const t = useI18NPrefix('view.tabs');

  const redirect = useCallback(
    (currentEditingViewKey?: string) => {
      navigate(
        currentEditingViewKey
          ? `/organizations/${orgId}/views/${currentEditingViewKey}`
          : `/organizations/${orgId}/views`,
      );
    },
    [navigate, orgId],
  );

  const tabChange = useCallback(
    (activeKey: string) => {
      if (id !== activeKey) {
        navigate(`/organizations/${orgId}/views/${activeKey}`);
      }
    },
    [navigate, id, orgId],
  );

  const tabEdit = useCallback(
    (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
      if (action !== 'remove' || typeof targetKey !== 'string') return;
      const view = editingViews.find(v => v.id === targetKey);
      if (!view) return;
      if (!view.touched) {
        dispatch(removeEditingView({ id: targetKey, resolve: redirect }));
      } else {
        setOperatingView(view);
        setConfirmVisible(true);
      }
    },
    [dispatch, editingViews, redirect],
  );

  const removeTab = useCallback(() => {
    if (!operatingView) return;
    dispatch(removeEditingView({ id: operatingView.id, resolve: redirect }));
    setConfirmVisible(false);
  }, [dispatch, operatingView, redirect]);

  const runTab = useCallback(() => {
    const fragment = editorInstance
      ?.getModel()
      ?.getValueInRange(editorInstance.getSelection()!);
    setConfirmVisible(false);
    dispatch(runSql({ id, isFragment: !!fragment }));
  }, [dispatch, id, editorInstance]);

  const items = useMemo(
    () =>
      editingViews.map(view => ({
        key: view.id,
        label: (
          <Dropdown
            trigger={['contextMenu']}
            menu={{
              items: [
                { key: 'CLOSE_OTHER', label: t('closeOther') },
                { key: 'CLOSE_ALL', label: t('closeAll') },
              ],
              onClick: e => {
                e.domEvent.stopPropagation();
                if (e.key === 'CLOSE_OTHER') {
                  dispatch(closeOtherEditingViews({ id: view.id, resolve: redirect }));
                } else {
                  dispatch(closeAllEditingViews({ resolve: redirect }));
                }
              },
            }}
          >
            <span style={{ color: view.error ? token.colorError : undefined }}>
              {view.name}
            </span>
          </Dropdown>
        ),
        closeIcon: (
          <CloseIcon
            touched={view.touched}
            stage={view.stage}
            error={!!view.error}
          />
        ),
      })),
    [dispatch, editingViews, redirect, t, token.colorError],
  );

  return (
    <div
      style={{
        zIndex: 1,
        flexShrink: 0,
        paddingInline: token.paddingSM,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <AntTabs
        hideAdd
        type="editable-card"
        size="small"
        activeKey={id}
        items={items}
        onChange={tabChange}
        onEdit={tabEdit}
        style={{ marginBottom: -1 }}
      />
      <Modal
        open={confirmVisible}
        title={t('warning')}
        onCancel={() => setConfirmVisible(false)}
        footer={
          <Space>
            <Button onClick={removeTab}>{t('discard')}</Button>
            <Button onClick={() => setConfirmVisible(false)}>{t('cancel')}</Button>
            <Button onClick={runTab} type="primary">
              {t('execute')}
            </Button>
          </Space>
        }
      >
        <Space>
          <InfoCircleOutlined style={{ color: token.colorWarning }} />
          <span>{t('warning')}</span>
        </Space>
      </Modal>
    </div>
  );
});

interface CloseIconProps {
  touched: boolean;
  stage: ViewViewModelStages;
  error: boolean;
}

function CloseIcon({ touched, stage, error }: CloseIconProps) {
  const { token } = theme.useToken();
  const [hovering, setHovering] = useState(false);
  let icon: React.ReactNode;

  if (
    stage === ViewViewModelStages.Loading ||
    stage === ViewViewModelStages.Running ||
    stage === ViewViewModelStages.Saving
  ) {
    icon = <LoadingOutlined />;
  } else if (hovering) {
    icon = <CloseOutlined />;
  } else if (error) {
    icon = <InfoCircleOutlined style={{ color: token.colorError }} />;
  } else if (touched) {
    icon = (
      <span
        style={{
          display: 'block',
          width: 8,
          height: 8,
          background: token.colorTextTertiary,
          borderRadius: '50%',
        }}
      />
    );
  } else {
    icon = <CloseOutlined />;
  }

  return (
    <span
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
      }}
    >
      {icon}
    </span>
  );
}
