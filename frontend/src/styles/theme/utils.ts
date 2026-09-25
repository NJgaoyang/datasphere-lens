import { theme as antdTheme, ThemeConfig } from 'antd';
import { StorageKeys } from 'globalConstants';
import { lensDark, lensLight, lensMetrics } from '../lensTokens';
import { ThemeKeyType } from './slice/types';
import { themes } from './themes';

/* istanbul ignore next line */
export const isSystemDark = window?.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')?.matches
  : undefined;

export function saveTheme(theme: ThemeKeyType) {
  window.localStorage && localStorage.setItem(StorageKeys.Theme, theme);
}

/* istanbul ignore next line */
export function getThemeFromStorage(): ThemeKeyType {
  let theme = 'light' as ThemeKeyType;
  try {
    const storedTheme =
      window.localStorage && localStorage.getItem(StorageKeys.Theme);
    if (storedTheme) {
      theme = storedTheme as ThemeKeyType;
    }
  } catch (error) {
    throw error;
  }
  return theme;
}

export function getAntdThemeConfig(themeKey: string): ThemeConfig {
  const currentTheme = themes[themeKey] || themes.light;
  const isDark = themeKey === 'dark';
  const lens = isDark ? lensDark : lensLight;

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: lens.brand,
      colorInfo: lens.brand,
      colorSuccess: currentTheme.success,
      colorError: currentTheme.error,
      colorWarning: currentTheme.warning,
      colorLink: lens.brand,
      colorBgLayout: lens.canvas,
      colorBgContainer: lens.surface,
      colorBgElevated: lens.surface,
      colorFillAlter: lens.surfaceMuted,
      colorFillSecondary: lens.surfaceHover,
      colorBorder: lens.borderStrong,
      colorBorderSecondary: lens.border,
      colorText: lens.text,
      colorTextSecondary: lens.textSecondary,
      colorTextTertiary: lens.textTertiary,
      borderRadius: lensMetrics.radius,
      borderRadiusLG: lensMetrics.radiusLarge,
      borderRadiusSM: lensMetrics.radiusSmall,
      controlHeight: lensMetrics.controlHeight,
      controlHeightLG: lensMetrics.controlHeightLarge,
      fontSize: 14,
      fontSizeSM: 12,
      lineHeight: 1.5715,
      boxShadowSecondary: isDark
        ? '0 6px 24px rgba(0, 0, 0, 0.36)'
        : '0 6px 24px rgba(31, 35, 41, 0.08)',
    },
    components: {
      Layout: {
        headerBg: lens.surface,
        siderBg: lens.surface,
        bodyBg: lens.canvas,
      },
      Menu: {
        darkItemBg: lens.surface,
        darkSubMenuItemBg: lens.surface,
        darkItemSelectedBg: lens.brandSoft,
        itemBorderRadius: lensMetrics.radius,
        itemHeight: 36,
        itemMarginInline: 8,
      },
      Button: {
        borderRadius: lensMetrics.radius,
        controlHeight: lensMetrics.controlHeight,
        primaryShadow: 'none',
      },
      Card: {
        borderRadiusLG: lensMetrics.radiusLarge,
        headerHeight: 48,
      },
      Table: {
        headerBg: lens.surfaceMuted,
        headerColor: currentTheme.textColor,
        headerBorderRadius: 6,
        rowHoverBg: lens.surfaceHover,
      },
      Input: {
        activeShadow: '0 0 0 2px rgba(22,119,255,.10)',
      },
      Select: {
        optionSelectedBg: lens.brandSoft,
      },
      Modal: {
        borderRadiusLG: lensMetrics.radiusLarge,
        titleFontSize: 16,
      },
      Drawer: {
        colorBgElevated: lens.surface,
      },
      Tabs: {
        itemSelectedColor: lens.brand,
        inkBarColor: lens.brand,
        itemHoverColor: lens.brandHover,
      },
      Tree: {
        nodeHoverBg: lens.surfaceHover,
        nodeSelectedBg: lens.brandSoft,
        directoryNodeSelectedBg: lens.brandSoft,
        directoryNodeSelectedColor: lens.brand,
      },
      Segmented: {
        itemSelectedBg: lens.surface,
        itemHoverBg: lens.surfaceHover,
        trackBg: lens.surfaceMuted,
      },
      Dropdown: {
        colorBgElevated: lens.surface,
        controlItemBgHover: lens.surfaceHover,
        controlItemBgActive: lens.brandSoft,
      },
      Popover: {
        colorBgElevated: lens.surface,
      },
      Form: {
        labelColor: lens.textSecondary,
      },
    },
  };
}
