function createElement(tag: string, attributes: Record<string, any>, ...children: Array<HTMLElement | string>): HTMLElement {
  const dom = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    dom.setAttribute(key, value);
  }
  dom.append(...children);

  return dom;
}

const h = createElement;

export { createElement, h };
