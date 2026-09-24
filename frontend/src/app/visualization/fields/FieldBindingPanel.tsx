import { Empty } from 'antd';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { FieldBinding } from '../core/ChartSpec';
import { FieldSlotSchema } from '../config/ConfigSchema';

export interface FieldBindingPanelProps {
  slots: FieldSlotSchema[];
  bindings: Record<string, FieldBinding[]>;
  renderBinding?: (binding: FieldBinding, slot: FieldSlotSchema) => ReactNode;
  renderEmpty?: (slot: FieldSlotSchema) => ReactNode;
}

const FieldBindingPanel: FC<FieldBindingPanelProps> = ({
  slots,
  bindings,
  renderBinding = binding => binding.alias || binding.fieldName || binding.fieldId,
  renderEmpty = slot => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`Drop ${slot.label}`} />,
}) => {
  return (
    <Panel>
      {slots.map(slot => {
        const fields = bindings[slot.key] || [];
        return (
          <Slot key={slot.key} data-slot-key={slot.key}>
            <SlotHeader>
              <span>{slot.label}</span>
              <span>{fields.length}{typeof slot.max === 'number' ? ` / ${slot.max}` : ''}</span>
            </SlotHeader>
            <SlotBody>
              {fields.length
                ? fields.map(field => (
                    <Binding key={`${slot.key}-${field.fieldId}`}>
                      {renderBinding(field, slot)}
                    </Binding>
                  ))
                : renderEmpty(slot)}
            </SlotBody>
          </Slot>
        );
      })}
    </Panel>
  );
};
export default FieldBindingPanel;

const Panel = styled.div`
  display: grid;
  gap: 12px;
`;

const Slot = styled.section`
  border: 1px solid ${({ theme }) => theme?.borderColorSplit || '#f0f0f0'};
  border-radius: 6px;
  padding: 10px;
`;

const SlotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
`;

const SlotBody = styled.div`
  display: grid;
  gap: 6px;
`;

const Binding = styled.div`
  padding: 6px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme?.bodyBackground || '#fafafa'};
`;
