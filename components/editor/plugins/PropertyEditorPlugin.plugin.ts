import type { EditorPlugin } from '../../../types';
import { PropertyEditorPopover } from './PropertyEditorPlugin';
import { handleWidgetClick } from './propertyEditorUtils';

export const propertyEditorPlugin: EditorPlugin = {
  id: 'property-editor',
  name: 'Property Editor',
  onClick: handleWidgetClick,
  Popover: PropertyEditorPopover,
};
