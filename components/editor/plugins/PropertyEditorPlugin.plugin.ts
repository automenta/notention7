import type { EditorPlugin } from '../../../types';
import {
  handleWidgetClick,
  PropertyEditorPopover,
} from './PropertyEditorPlugin';

export const propertyEditorPlugin: EditorPlugin = {
  id: 'property-editor',
  name: 'Property Editor',
  onClick: handleWidgetClick,
  Popover: PropertyEditorPopover,
};
