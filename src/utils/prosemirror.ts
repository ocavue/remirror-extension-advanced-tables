import { Fragment, Slice } from '@remirror/pm/model';
import { ReplaceAroundStep, Transform } from '@remirror/pm/transform';

type Attrs = Record<string, any>;

// Change the attributes of the node at `pos`.
export function setNodeAttrs<T extends Transform>(tr: T, pos: number, attrs: Attrs): T {
  let node = tr.doc.nodeAt(pos);
  if (!node) throw new RangeError('No node at given position');
  let type = node.type;
  let newNode = type.create({ ...node.attrs, ...attrs }, undefined, node.marks);
  if (node.isLeaf) return tr.replaceWith(pos, pos + node.nodeSize, newNode);

  if (!type.validContent(node.content)) throw new RangeError('Invalid content for node type ' + type.name);

  return tr.step(
    new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1, new Slice(Fragment.from(newNode), 0, 0), 1, true),
  );
}
