import pkg from "./package.json"
import typescript from "@rollup/plugin-typescript"
import del from "rollup-plugin-delete"
import { terser } from "rollup-plugin-terser"
import { getBabelOutputPlugin } from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

const terserConfig = {
    keep_classnames: /AbortSignal/,
    format: {
        comments: false,
    },
}

export default [{
    input: './src/index.ts',
    output: {// for esm publish
        file: pkg.module,
        format: 'esm',
        name: pkg.name,
    },
    plugins: [
        del({ targets: ['./dist'], }),
        del({ targets: ['./dist/types/pipes.d.ts'], hook: 'closeBundle' }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: "./types",
        }),
        getBabelOutputPlugin({
            presets: [['@babel/preset-env', {
                useBuiltIns: 'usage', corejs: { version: '3.15' },
                targets: pkg.browserslist,
                debug: false,
            },]],
            plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]]
        }),
        terser(terserConfig),
    ],
    external: [/@babel\/runtime/, /fetch/, /abort/],
}, {// for umd publish
    input: './src/index.ts',
    output: {
        file: pkg.main,
        // format: 'umd',
        name: pkg.name,
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
        }),
        getBabelOutputPlugin({
            presets: [['@babel/preset-env', {
                modules: 'umd',
                useBuiltIns: 'usage', corejs: { version: '3.15' },
                targets: pkg.browserslist,
            }]],
            plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]]
        }),
        terser(terserConfig),
    ],
    external: [/@babel\/runtime/, /fetch/, /abort/],
}, {// for browser test
    input: './src/index.ts',
    output: {
        file: 'test/src/index.browser.js',
        format: 'umd',
        // name for testEnv puppeteer
        name: 'test',
    },
    plugins: [
        del({ targets: ['./test/src'], }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        terser(terserConfig),
    ],
    external: [/fetch/, /abort/],
}, {// for node test
    input: './src/index.ts',
    output: {
        file: 'test/src/index.node.js',
        format: 'cjs',
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
        }),
        nodeResolve(),
        commonjs({ ignoreTryCatch: ['encoding'] }),
        terser(terserConfig),
    ],
}, {// common pipes for test
    input: './src/pipes.ts',
    output: {
        file: 'test/pipes.js',
        format: 'umd',
        name: 'pipes',
    },
    plugins: [
        del({ targets: ['./test/pipes.js'] }),
        typescript({ tsconfig: false, target: "ESNext" }),
    ]
}]