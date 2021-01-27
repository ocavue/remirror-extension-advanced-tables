function createElement(tag: string, attributes: Record<string, any>, ...children: HTMLElement[]): HTMLElement {
    let dom = document.createElement(tag);
    for (let [key, value] of Object.entries(attributes)) {
        dom.setAttribute(key, value)
    }
    dom.append(...children)


    return dom
}

const h = createElement

export {createElement, h}
