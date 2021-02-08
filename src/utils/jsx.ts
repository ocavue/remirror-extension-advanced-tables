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

// When using 'jsx-dom', because of some limit of TypeScript, the
// return type of <div/> is `JSX.Element` instead of `HTMLDivElement`.
// The following type is compatible with both `document.createElement`
// and `JSX.Element`.
export type DOM = JSX.Element | HTMLElement;
