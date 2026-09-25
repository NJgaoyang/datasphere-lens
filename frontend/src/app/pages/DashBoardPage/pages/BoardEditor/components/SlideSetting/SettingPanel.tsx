import { ReactElement } from 'react';
import styled from 'styled-components';
import { SPACE_LG, SPACE_MD } from 'styles/StyleConstants';
import { stopPPG } from 'utils/utils';

interface SettingPanelProps {
  title?: string;
  description?: string;
  children?: ReactElement;
}

export function SettingPanel({ title, description, children }: SettingPanelProps) {
  return (
    <Wrapper>
      {(title || description) && (
        <SectionHeader>
          {title && <strong>{title}</strong>}
          {description && <span>{description}</span>}
        </SectionHeader>
      )}
      <div onClick={stopPPG} className="form-wrapper">
        {children}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: ${SPACE_MD};

  .form-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
  }
`;

export const Group = styled.div`
  padding: 0 ${SPACE_LG};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0 10px;
  margin-bottom: 4px;
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  strong {
    font-size: 12px;
    color: ${p => p.theme.textColor};
  }

  span {
    font-size: 11px;
    color: ${p => p.theme.textColorDisabled};
  }
`;
