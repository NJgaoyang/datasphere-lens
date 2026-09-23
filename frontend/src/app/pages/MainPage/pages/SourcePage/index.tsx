/**
 * DataSphere Lens
 *
 * Source keeps Datart business capabilities while the product layer uses
 * the DataSphere Lens resource-management experience.
 */
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { useMatch } from 'react-router-dom';
import styled from 'styled-components';
import { LensSourceListPage } from './LensSourceListPage';
import { SaveForm } from './SaveForm';
import { SaveFormContext, useSaveFormContext } from './SaveFormContext';
import { useSourceSlice } from './slice';
import { SourceDetailPage } from './SourceDetailPage';

export function SourcePage() {
  useSourceSlice();
  const saveFormContextValue = useSaveFormContext();
  const tg = useI18NPrefix('global');
  const sourceDetailMatch = useMatch(
    '/organizations/:orgId/sources/:sourceId',
  );

  return (
    <SaveFormContext.Provider value={saveFormContextValue}>
      <SourcePageContainer>
        {sourceDetailMatch ? <SourceDetailPage /> : <LensSourceListPage />}
      </SourcePageContainer>
      <SaveForm
        formProps={{
          labelAlign: 'left',
          labelCol: { offset: 1, span: 8 },
          wrapperCol: { span: 13 },
        }}
        okText={tg('button.save')}
      />
    </SaveFormContext.Provider>
  );
}
const SourcePageContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;
