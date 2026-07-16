import { nameToEmoji } from "gemoji";
import type { Node, Parent, Text } from "mdast";

function isParent(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

function isText(node: Node): node is Text {
  return node.type === "text";
}

function visitTextNodes(node: Node, callback: (node: Text) => void): void {
  if (isText(node)) {
    callback(node);
  }
  if (isParent(node)) {
    for (const child of node.children) {
      visitTextNodes(child, callback);
    }
  }
}

export function remarkEmoji() {
  return (tree: Node) => {
    visitTextNodes(tree, (node) => {
      node.value = node.value.replace(
        /:(\w+):/g,
        (match: string, name: string) => {
          return nameToEmoji[name] ?? match;
        }
      );
    });
  };
}
