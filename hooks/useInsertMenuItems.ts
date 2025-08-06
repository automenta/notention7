import { useMemo } from 'react';
import { useOntologyIndex } from './useOntologyIndex';

export interface InsertMenuItem {
  id: string;
  type: 'tag' | 'template' | 'property';
  label: string;
  description?: string;
}

export type InsertMenuMode = 'all' | 'property';

// This hook now accepts the output of `useOntologyIndex`
export const useInsertMenuItems = (
  indexedOntology: ReturnType<typeof useOntologyIndex>,
  mode: InsertMenuMode = 'all'
): InsertMenuItem[] => {
  const { allTags, allTemplates, allProperties } = indexedOntology;

  return useMemo(() => {
    let items: InsertMenuItem[] = [];

    if (mode === 'all') {
      // Add tags
      allTags.forEach((tag) => {
        items.push({
          id: `tag-${tag.id}`,
          type: 'tag',
          label: tag.label,
          description: tag.description || 'Tag',
        });
      });

      // Add templates
      allTemplates.forEach((template) => {
        items.push({
          id: `template-${template.id}`,
          type: 'template',
          label: template.label,
          description: template.description || 'Template',
        });
      });
    }

    // Add property keys (in both modes)
    allProperties.forEach((prop) => {
      items.push({
        id: `property-${prop.id}`,
        type: 'property',
        label: prop.label,
        description: prop.description || 'Property',
      });
    });

    // If in 'all' mode, filter out properties that are part of templates already shown
    if (mode === 'all') {
      const templateProps = new Set(
        allTemplates.flatMap((t) => (t.attributes ? Object.keys(t.attributes) : []))
      );
      items = items.filter(
        (item) => item.type !== 'property' || !templateProps.has(item.label)
      );
    }

    // Sort alphabetically by label for consistent ordering
    return items.sort((a, b) => a.label.localeCompare(b.label));
  }, [allTags, allTemplates, allProperties, mode]);
};
