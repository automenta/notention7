import {useMemo} from 'react';
import type {OntologyAttribute, OntologyNode} from '@/types';

export const useOntologyIndex = (ontology: OntologyNode[]) => {
    return useMemo(() => {
        const safeOntology = Array.isArray(ontology) ? ontology : [];

        const tags = new Set<{ id: string; label: string; description?: string }>();
        const propertyTypes = new Map<string, OntologyAttribute>();
        const templates =
            safeOntology.find((n) => n.id === 'templates')?.children || [];

        function traverse(nodes: OntologyNode[]) {
            nodes.forEach((node) => {
                // Don't add 'Templates' itself as a tag, or its children
                if (node.id !== 'templates') {
                    tags.add({
                        id: node.id,
                        label: node.label,
                        description: node.description,
                    });
                }

                if (node.attributes) {
                    Object.entries(node.attributes).forEach(([attrKey, attrValue]) => {
                        if (!propertyTypes.has(attrKey)) {
                            // Ensure operators object exists to prevent crashes downstream
                            const safeAttrValue = {
                                ...attrValue,
                                operators: attrValue.operators || {real: [], imaginary: []},
                            };
                            propertyTypes.set(attrKey, safeAttrValue);
                        }
                    });
                }

                if (node.children) {
                    traverse(node.children);
                }
            });
        }

        traverse(safeOntology);

        const allProperties = Array.from(propertyTypes.keys()).map((key) => ({
            id: key,
            label: key,
            description: propertyTypes.get(key)?.description,
        }));

        const buildPropertyTree = (nodes: OntologyNode[]): OntologyNode[] => {
            return nodes
                .map((node) => {
                    const children = node.children
                        ? buildPropertyTree(node.children)
                        : [];
                    const hasAttributes = node.attributes && Object.keys(node.attributes).length > 0;
                    if (hasAttributes || children.length > 0) {
                        return {...node, children};
                    }
                    return null;
                })
                .filter((node): node is OntologyNode => node !== null);
        };

        const propertyTree = buildPropertyTree(safeOntology);

        return {
            allTags: Array.from(tags).filter(
                (t) => !templates.some((tmpl) => tmpl.id === t.id)
            ),
            allProperties,
            allTemplates: templates,
            propertyTypes,
            propertyTree,
        };
    }, [ontology]);
};
