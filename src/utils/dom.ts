export function stopEvent(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}
