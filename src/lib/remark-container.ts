import type { Node, Parent, Text, Paragraph } from "mdast";
import type { ContainerDirective, TextDirective, LeafDirective } from "mdast-util-directive";

/**
 * 将 VitePress 风格 ::: type label 预处理为 remark-directive 标准语法 :::type[label]
 */
export function preprocessContainers(content: string): string {
  return content.replace(
    /^::: (\w+)(?:\s+(.+?))?\s*$/gm,
    (_match: string, type: string, label: string | undefined) => {
      if (label) {
        return `:::${type}[${label}]`;
      }
      return `:::${type}`;
    }
  );
}

function isParent(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

function visitNodes(
  node: Node,
  type: string,
  callback: (node: Node) => void
): void {
  if (node.type === type) {
    callback(node);
  }
  if (isParent(node)) {
    for (const child of node.children) {
      visitNodes(child, type, callback);
    }
  }
}

export function remarkContainer() {
  return (tree: Node) => {
    visitNodes(tree, "containerDirective", (node) => {
      const directive = node as ContainerDirective;
      const type = directive.name;

      // 提取 label：如果第一个子段落标记为 directiveLabel，则取它的文本
      let label = type.toUpperCase();
      if (directive.children.length > 0) {
        const first = directive.children[0];
        if (first.type === "paragraph" && first.data?.directiveLabel) {
          label = first.children
            .filter((n): n is Text => n.type === "text")
            .map((n) => n.value)
            .join("");
          directive.children.shift();
        }
      }

      // details 类型使用原生 <details> / <summary>
      if (type === "details") {
        directive.data = {
          hName: "details",
          hProperties: {
            className: ["custom-block", type],
          },
        };
        if (label) {
          const summaryNode: Paragraph = {
            type: "paragraph",
            data: {
              hName: "summary",
              hProperties: {
                className: ["custom-block-title", `custom-block-title--${type}`],
              },
            },
            children: [{ type: "text", value: label }],
          };
          directive.children.unshift(summaryNode);
        }
        return;
      }

      // 其他类型渲染为 <div>
      directive.data = {
        hName: "div",
        hProperties: {
          className: ["custom-block", type],
          "data-label": label,
        },
      };

      if (label) {
        const titleNode: Paragraph = {
          type: "paragraph",
          data: {
            hName: "div",
            hProperties: {
              className: ["custom-block-title", `custom-block-title--${type}`],
            },
          },
          children: [{ type: "text", value: label }],
        };
        directive.children.unshift(titleNode);
      }
    });

    // 处理未设置的 textDirective，避免被 mdast-util-to-hast 转为空 <div> 导致 p > div
    visitNodes(tree, "textDirective", (node) => {
      const directive = node as TextDirective;
      const nameNode: Text = { type: "text", value: `:${directive.name}` };
      directive.children.unshift(nameNode);
      directive.data = {
        hName: "span",
        hProperties: { className: ["text-directive"] },
      };
    });

    // 处理未设置的 leafDirective，同理转为 <span>
    visitNodes(tree, "leafDirective", (node) => {
      const directive = node as LeafDirective;
      const nameNode: Text = { type: "text", value: `::${directive.name}` };
      directive.children.unshift(nameNode);
      directive.data = {
        hName: "span",
        hProperties: { className: ["leaf-directive"] },
      };
    });
  };
}
