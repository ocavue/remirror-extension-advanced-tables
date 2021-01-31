function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: Record<string, any>,
  ...children: Array<Element | string>
) {
  const dom = document.createElement(tag);
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      dom.setAttribute(key, value);
    }
  }
  dom.append(...children);
  return dom;
}

const h = createElement;

export { createElement, h };
