export function stopEvent(e: Pick<MouseEvent, 'preventDefault' | 'stopPropagation'>) {
  e.preventDefault();
  e.stopPropagation();
}
