import { describe, it, expect } from 'vitest';
import { editorHeaderPlugin } from '../../../../components/editor/plugins/EditorHeaderPlugin.plugin';
import { insertMenuPlugin } from '../../../../components/editor/plugins/InsertMenuPlugin.plugin';
import { propertyEditorPlugin } from '../../../../components/editor/plugins/PropertyEditorPlugin.plugin';
import { selectionToolbarPlugin } from '../../../../components/editor/plugins/SelectionToolbarPlugin.plugin';
import { semanticInsertPlugin } from '../../../../components/editor/plugins/SemanticInsertPlugin.plugin';
import { toolbarPlugin } from '../../../../components/editor/plugins/ToolbarPlugin.plugin';

describe('Plugin Definitions', () => {
  it('editorHeaderPlugin should have a valid HeaderComponent', () => {
    expect(editorHeaderPlugin.HeaderComponent).toBeDefined();
    expect(typeof editorHeaderPlugin.HeaderComponent).toBe('function');
  });

  it('insertMenuPlugin should have a valid Popover and api', () => {
    expect(insertMenuPlugin.Popover).toBeDefined();
    expect(typeof insertMenuPlugin.Popover).toBe('function');
    expect(insertMenuPlugin.api).toBeDefined();
    expect(typeof insertMenuPlugin.api).toBe('object');
  });

  it('propertyEditorPlugin should have a valid Popover', () => {
    expect(propertyEditorPlugin.Popover).toBeDefined();
    expect(typeof propertyEditorPlugin.Popover).toBe('function');
  });

  it('selectionToolbarPlugin should have a valid ToolbarComponent', () => {
    expect(selectionToolbarPlugin.ToolbarComponent).toBeDefined();
    expect(typeof selectionToolbarPlugin.ToolbarComponent).toBe('function');
  });

  it('semanticInsertPlugin should have a valid Popover, ToolbarComponent and api', () => {
    expect(semanticInsertPlugin.Popover).toBeDefined();
    expect(typeof semanticInsertPlugin.Popover).toBe('function');
    expect(semanticInsertPlugin.ToolbarComponent).toBeDefined();
    expect(typeof semanticInsertPlugin.ToolbarComponent).toBe('function');
    expect(semanticInsertPlugin.api).toBeDefined();
    expect(typeof semanticInsertPlugin.api).toBe('object');
  });

  it('toolbarPlugin should have a valid ToolbarComponent', () => {
    expect(toolbarPlugin.ToolbarComponent).toBeDefined();
    expect(typeof toolbarPlugin.ToolbarComponent).toBe('function');
  });
});
