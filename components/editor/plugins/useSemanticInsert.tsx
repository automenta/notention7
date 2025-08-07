import { useContext } from 'react';
import {
  SemanticInsertContext,
  SemanticInsertContextType,
} from './semanticInsert.context';

export const useSemanticInsert = (): SemanticInsertContextType => {
  const context = useContext(SemanticInsertContext);
  if (!context) {
    throw new Error(
      'useSemanticInsert must be used within a SemanticInsertProvider'
    );
  }
  return context;
};
