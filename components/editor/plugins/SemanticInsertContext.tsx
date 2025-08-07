import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SemanticInsertContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const SemanticInsertContext = createContext<SemanticInsertContextType | undefined>(
  undefined
);

export const SemanticInsertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <SemanticInsertContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </SemanticInsertContext.Provider>
  );
};

export const useSemanticInsert = (): SemanticInsertContextType => {
  const context = useContext(SemanticInsertContext);
  if (!context) {
    throw new Error(
      'useSemanticInsert must be used within a SemanticInsertProvider'
    );
  }
  return context;
};
