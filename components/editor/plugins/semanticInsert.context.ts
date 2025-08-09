import {createContext} from 'react';

export interface SemanticInsertContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const SemanticInsertContext = createContext<
    SemanticInsertContextType | undefined
>(undefined);
