import { theme as antdTheme, ThemeConfig } from 'antd';
import { StorageKeys } from 'globalConstants';
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

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: currentTheme.primary,
      colorInfo: currentTheme.processing,
      colorSuccess: currentTheme.success,
      colorError: currentTheme.error,
      colorWarning: currentTheme.warning,
      colorLink: currentTheme.primary,
      colorBgLayout: isDark ? '#0f1115' : '#f5f7fa',
      colorBgContainer: isDark ? '#17191f' : '#ffffff',
      colorBorderSecondary: isDark ? '#2a2d35' : '#edf0f5',
      colorText: isDark ? '#f5f5f5' : '#1f2329',
      colorTextSecondary: isDark ? '#a6a8ad' : '#646a73',
      colorTextTertiary: isDark ? '#777b84' : '#8f959e',
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      controlHeight: 32,
      controlHeightLG: 40,
      fontSize: 14,
      fontSizeSM: 12,
      lineHeight: 1.5715,
      boxShadowSecondary: isDark
        ? '0 6px 24px rgba(0, 0, 0, 0.36)'
        : '0 6px 24px rgba(31, 35, 41, 0.08)',
    },
    components: {
      Layout: {
        headerBg: isDark ? '#17191f' : '#ffffff',
        siderBg: '#001529',
        bodyBg: isDark ? '#0f1115' : '#f5f7fa',
      },
      Menu: {
        darkItemBg: '#001529',
        darkSubMenuItemBg: '#001529',
        darkItemSelectedBg: '#1677ff',
        itemBorderRadius: 6,
        itemHeight: 40,
        itemMarginInline: 8,
      },
      Button: {
        borderRadius: 6,
        controlHeight: 32,
        primaryShadow: 'none',
      },
      Card: {
        borderRadiusLG: 8,
        headerHeight: 48,
      },
      Table: {
        headerBg: isDark ? '#20232a' : '#f7f8fa',
        headerColor: currentTheme.textColor,
        headerBorderRadius: 6,
        rowHoverBg: isDark ? '#22252c' : '#f5f9ff',
      },
      Input: {
        activeShadow: '0 0 0 2px rgba(22,119,255,.10)',
      },
      Select: {
        optionSelectedBg: isDark ? '#1d3555' : '#e6f4ff',
      },
      Modal: {
        borderRadiusLG: 10,
        titleFontSize: 16,
      },
      Drawer: {
        colorBgElevated: isDark ? '#17191f' : '#ffffff',
      },
      Tabs: {
        itemSelectedColor: currentTheme.primary,
        inkBarColor: currentTheme.primary,
      },
      Form: {
        labelColor: isDark ? '#d7d8db' : '#1f2329',
      },
    },
  };
}
