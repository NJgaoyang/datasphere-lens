import { Result } from 'antd';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  visualType: string;
}

interface State {
  error?: Error;
}

export default class VisualErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`VisualRenderer | ${this.props.visualType}`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="error"
          title="Visual failed to render"
          subTitle={`${this.props.visualType}: ${this.state.error.message}`}
        />
      );
    }
    return this.props.children;
  }
}
