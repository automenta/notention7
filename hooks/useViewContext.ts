import { useContext } from 'react';
import {
  ViewContext,
  type ViewContextType,
} from '../components/contexts/view';

export const useViewContext = (): ViewContextType => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};
