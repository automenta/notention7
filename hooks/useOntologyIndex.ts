
import { useMemo } from 'react';
import type { OntologyNode } from '../types';

export const useOntologyIndex = (ontology: OntologyNode[]) => {
    return useMemo(() => {
        const safeOntology = Array.isArray(ontology) ? ontology : [];

        const tags = new Set<{ id: string; label: string, description?: string }>();
        const props = new Map<string, { id: string; label: string, description?: string }>();
        const templates = safeOntology.find(n => n.id === 'templates')?.children || [];
        
        function traverse(nodes: OntologyNode[], isTemplateContext: boolean) {
            nodes.forEach(node => {
                // Don't add templates themselves or their children as regular tags/props
                if (!isTemplateContext) { 
                    tags.add({ id: node.id, label: node.label, description: node.description });
                    if (node.attributes) {
                        Object.entries(node.attributes).forEach(([attrKey, attrValue]) => {
                            if (!props.has(attrKey)) {
                                props.set(attrKey, { id: `${node.id}-${attrKey}`, label: attrKey, description: attrValue.description });
                            }
                        });
                    }
                }
                if (node.children) {
                    traverse(node.children, isTemplateContext || node.id === 'templates');
                }
            });
        }
        
        traverse(safeOntology, false);

        return { 
            allTags: Array.from(tags), 
            allProperties: Array.from(props.values()), 
            allTemplates: templates 
        };
    }, [ontology]);
};