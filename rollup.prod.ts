import pkg from "./package.json"
import typescript from "@rollup/plugin-typescript"
import del from "rollup-plugin-delete"
import { terser } from "rollup-plugin-terser"
import { getBabelOutputPlugin } from "@rollup/plugin-babel"

export default [{
    input: './src/index.ts',
    output: {// for esm publish
        file: pkg.module,
        format: 'esm',
        name: pkg.name,
    },
    plugins: [
        del({ targets: ['./bin'], }),
        del({ targets: ['./bin/types/pipes.d.ts'], hook: 'closeBundle' }),
        del({ targets: ['./bin/types/polyfill'], hook: 'closeBundle' }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: "./types",
        }),
        getBabelOutputPlugin({
            presets: [['@babel/preset-env', {
                useBuiltIns: 'usage', corejs: { version: '3.15' },
                targets: pkg.browserslist,
            },]],
            plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]]
        }),
        terser(),
    ],
    external: [/@babel\/runtime/],
}, {
    input: './src/index.ts',
    output: {// for umd publish
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
        terser(),
    ],
    external: [/@babel\/runtime/],
},
{// for polyfill
    input: {
        globalThis: './src/polyfill/globalThis.ts',
    },
    output: {
        dir: './polyfill',
        entryFileNames: '[name]/index.js',
        format: 'esm',
    },
    plugins: [
        del({ targets: ['./polyfill'] }),
        typescript({
            tsconfig: false,
            include: './src/polyfill/*',
        }),
        terser(),
    ]
}, {// for browser test
    input: './src/index.ts',
    output: {
        file: pkg.main.replace('bin', 'test/src').replace('umd', 'iife'),
        format: 'iife',
        // name for testEnv puppeteer
        name: 'test',
    },
    plugins: [
        del({ targets: ['./test/src'], }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        terser(),
    ]
}, {// common pipes for test
    input: './src/pipes.ts',
    output: {
        file: 'test/pipes.js',
        format: 'iife',
        name: 'pipes',
    },
    plugins: [
        del({ targets: ['./test/pipes.js'] }),
        typescript({ tsconfig: false, target: "ESNext" }),
    ]
}]