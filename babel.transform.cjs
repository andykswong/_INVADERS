const { types } = require('@babel/core');
const syntaxTypeScript = require('@babel/plugin-syntax-typescript').default;

/**
 * Plugin to help minifying the JS:
 * - Transpiles all enums into const object for inlining
 * - Replace all const with let
 * - Remove unused class methods
 */
module.exports = function minify() {
  return {
    name: 'minify',
    inherits: syntaxTypeScript,
    visitor: {
      TSEnumDeclaration(path) {
        const [constObjectPath] = path.replaceWith(
          tsEnumDeclarationToConstObject(path)
        );
        path.scope.registerDeclaration(constObjectPath);
      },
      VariableDeclaration(path) {
        path.replaceWith(variableDeclarationToLet(path));
      },
      ClassDeclaration(path) {
        path.replaceWith(removeMethodsFromClassDeclaration(path));
      },
    },
  };
};

function tsEnumDeclarationToConstObject(path) {
  return types.variableDeclaration('const', [
    types.variableDeclarator(
      path.node.id,
      types.objectExpression(
        tsEnumMembersToObjectProperties(path.get('members')),
      ),
    ),
  ]);
}

function tsEnumMembersToObjectProperties(memberPaths) {
  return memberPaths.map(({ node }) => {
    const keyNode = node.id;
    const valueNode = node.initializer;
    return types.objectProperty(keyNode, valueNode);
  });
}

function variableDeclarationToLet({ node }) {
  if (node.kind === 'const') {
    node.kind = 'let';
  }
  return node;
}

function removeMethodsFromClassDeclaration(path) {
  const { node } = path;
  const name = node.id.name;
  if (['NanoGLRenderingDevice', 'NanoGLRenderPassContext', 'GLBuffer', 'GLRenderPass', 'GLShader', 'GLPipeline'].includes(name)) {
    const properties = [];
    for (const property of node.body.body) {
      const propName = property.key.name;
      if (['texture', 'scissor', 'blendColor', 'stencilRef', 'viewport', 'destroy'].includes(propName)) {
        continue;
      }
      properties.push(property);
    }
    node.body.body = properties;
  }
  return node;
}
