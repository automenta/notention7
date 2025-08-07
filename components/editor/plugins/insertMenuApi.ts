import { InsertMenuMode } from '../../../hooks/useInsertMenuItems';

export type OpenMenuContext = {
  mode: InsertMenuMode;
  selectedValue?: string;
};

export const api: {
  open: (
    position?: { top: number; left: number },
    context?: OpenMenuContext
  ) => void;
  close: () => void;
} = {
  open: () => {},
  close: () => {},
};
