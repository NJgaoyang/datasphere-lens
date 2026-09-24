import { Collapse } from 'antd';
import { GroupLayout, ItemLayout } from 'app/components/FormGenerator';
import { FormGroupLayoutMode } from 'app/components/FormGenerator/constants';
import { ChartDataConfig, ChartStyleConfig } from 'app/types/ChartConfig';
import { FC } from 'react';
import { VisualConfigSchema } from './ConfigSchema';

export type ConfigSection = 'styles' | 'settings' | 'interactions';

export interface ConfigPanelProps {
  schema: VisualConfigSchema;
  section?: ConfigSection;
  dataConfigs?: ChartDataConfig[];
  context?: any;
  translate?: (key: string, disablePrefix?: boolean, options?: any) => string;
  onChange: (
    ancestors: number[],
    config: ChartStyleConfig,
    needRefresh?: boolean,
  ) => void;
}

const ConfigPanel: FC<ConfigPanelProps> = ({
  schema,
  section = 'styles',
  dataConfigs,
  context,
  translate = value => value,
  onChange,
}) => {
  const configs = schema[section] || [];

  return (
    <Collapse className="datart-config-panel" ghost>
      {configs.filter(item => !item.hidden).map((item, index) => {
        if (item.comType === 'group') {
          return (
            <Collapse.Panel header={translate(item.label, true)} key={item.key}>
              <GroupLayout
                ancestors={[index]}
                mode={FormGroupLayoutMode.INNER}
                data={item}
                translate={translate}
                dataConfigs={dataConfigs}
                onChange={onChange}
                context={context}
                flatten
              />
            </Collapse.Panel>
          );
        }
        return (
          <ItemLayout
            key={item.key}
            ancestors={[index]}
            data={item}
            translate={translate}
            dataConfigs={dataConfigs}
            onChange={onChange}
            context={context}
          />
        );
      })}
    </Collapse>
  );
};

export default ConfigPanel;
