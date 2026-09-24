export interface ChartThemeContext {
  mode?: 'light' | 'dark';
  locale?: string;
  palette?: string[];
}

export interface ChartViewportContext {
  width?: number;
  height?: number;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export interface ChartRuntimeContext {
  theme?: ChartThemeContext;
  viewport?: ChartViewportContext;
  timezone?: string;
  locale?: string;
  dashboardId?: string;
  widgetId?: string;
  readonly?: boolean;
  [key: string]: unknown;
}
