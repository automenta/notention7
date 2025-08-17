import React from 'react';
import type { AppSettings } from '../../../types';
import OntologyEditor from '../OntologyEditor';

interface OntologySettingsTabProps {
  settings: AppSettings;
}

export const OntologySettingsTab: React.FC<OntologySettingsTabProps> = ({
  settings,
}) => {
  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Ontology Management
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Define the types of tags and properties you can use in your notes.
      </p>
      <OntologyEditor ontology={settings.ontology} />
    </div>
  );
};
