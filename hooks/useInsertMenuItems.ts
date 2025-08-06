import { useMemo } from 'react';
import { Ontology } from '@/types';

export type InsertMenuItem = {
  id: string;
  type: 'tag' | 'template' | 'property';
  label: string;
  description?: string;
};

export type InsertMenuMode = 'all' | 'property';

export const useInsertMenuItems = (
  ontology: Ontology,
  mode: InsertMenuMode = 'all'
): InsertMenuItem[] => {
  return useMemo(() => {
    let items: InsertMenuItem[] = [];

    if (mode === 'all') {
      // Add tags
      ontology.tags.forEach((tag) => {
        items.push({
          id: `tag-${tag.id}`,
          type: 'tag',
          label: tag.id,
          description: tag.description || 'Tag',
        });
      });

      // Add templates
      ontology.templates.forEach((template) => {
        items.push({
          id: `template-${template.id}`,
          type: 'template',
          label: template.label,
          description: template.description || 'Template',
        });
      });
    }

    // Add property keys (in both modes)
    ontology.properties.forEach((prop) => {
      items.push({
        id: `property-${prop.id}`,
        type: 'property',
        label: prop.id,
        description: prop.description || 'Property',
      });
    });

    // If in 'all' mode, filter out properties that are part of templates already shown
    if (mode === 'all') {
      const templateProps = new Set(
        ontology.templates.flatMap((t) => Object.keys(t.attributes))
      );
      items = items.filter(
        (item) => item.type !== 'property' || !templateProps.has(item.label)
      );
    }

    // Sort alphabetically by label for consistent ordering
    return items.sort((a, b) => a.label.localeCompare(b.label));
  }, [ontology, mode]);
};
