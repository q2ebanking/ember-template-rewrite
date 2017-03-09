function nodeToLabel(node) {
  if (node.type === 'ElementModifierStatement') {
    return node.path.original;
  } else if (node.type === 'AttrNode') {
    return node.name;
  }
}

export { nodeToLabel };

