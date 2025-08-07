import { useContext } from 'react';
import {
  ViewContext,
  type ViewContextType,
} from '../components/contexts/ViewContext';

export const useView = (): ViewContextType => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
