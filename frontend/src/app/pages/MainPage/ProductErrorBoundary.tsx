import { Button, Result } from 'antd';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  homePath: string;
}

interface State {
  hasError: boolean;
}

export class ProductErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ProductErrorBoundary]', error, errorInfo);
  }

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Result
        status="error"
        title="页面加载失败"
        subTitle="当前页面发生异常，可以重新加载或返回工作台继续操作。"
        extra={[
          <Button key="reload" type="primary" onClick={() => window.location.reload()}>
            重新加载
          </Button>,
          <Button
            key="home"
            onClick={() => {
              window.location.href = this.props.homePath;
            }}
          >
            返回工作台
          </Button>,
        ]}
      />
    );
  }
}
