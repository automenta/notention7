import React, {ReactNode, useState} from 'react';
import {SemanticInsertContext} from './semanticInsert.context';

export const SemanticInsertProvider: React.FC<{ children: ReactNode }> = ({
                                                                              children,
                                                                          }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <SemanticInsertContext.Provider value={{isOpen, openModal, closeModal}}>
            {children}
        </SemanticInsertContext.Provider>
    );
};
