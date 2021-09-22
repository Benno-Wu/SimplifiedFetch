const fs = require('fs')
const path = require('path')

const allFiles = fs.readdirSync(path.resolve(__dirname, './browser'))
const files = allFiles.filter(v => /[^unknown].test/.test(v))
const browserTest = files.map(v => fs.readFileSync(path.resolve(__dirname, './browser', v)).toString().trim())

const { parse } = require('@babel/parser')
const types = require('@babel/types')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default

const escapePage = {
    ArrowFunctionExpression(path) {
        if (types.isMemberExpression(path.parent?.callee)
            && types.isIdentifier(path.parent.callee?.object, { name: 'page' })) {
            this.wanted._ = path.node
            this.wanted.__ = path.node.params
        }
        path.traverse({
            Identifier(path) {
                types.isMemberExpression(path.parent) && path.parent.object === path.node
                    && path.node.name == 'test' ? path.node.name = 'SimplifiedFetch' : void 0;
            }
        })
    }
}

const mainVisitors = [{
    AwaitExpression(path) {
        if (path.node.argument.callee?.object?.name == 'page') {
            const wanted = {}
            path.traverse(escapePage, { wanted })
            if (wanted?._) {
                const planB = types.callExpression(wanted._, wanted.__)
                path.replaceWith(types.awaitExpression(planB))
            }
        }
    }
},]

browserTest.forEach((v, i) => {
    const ast = parse(v)
    mainVisitors.forEach(v => traverse(ast, v))
    const code = generator(ast, { comments: false }, v).code
    console.log('writing... ', files[i])
    fs.writeFileSync(path.resolve(__dirname, './node/', files[i]), code)
})
