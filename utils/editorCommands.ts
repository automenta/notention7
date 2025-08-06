export const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export const queryCommandState = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

export const getSelectionParent = (): HTMLElement | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  return selection.getRangeAt(0).startContainer.parentElement;
};

export const toggleBlock = (tag: string) => {
  const parent = getSelectionParent();
  if (parent?.closest(tag)) {
    execCommand('formatBlock', '<p>');
  } else {
    execCommand('formatBlock', `<${tag}>`);
  }
};
