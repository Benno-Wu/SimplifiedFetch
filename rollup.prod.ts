import pkg from "./package.json"
import typescript from "@rollup/plugin-typescript"
import del from "rollup-plugin-delete"
import { uglify } from "rollup-plugin-uglify"

export default {
    // treeshake: false,
    input: './src/index.ts',
    output: [{//for umd publish
        file: pkg.main,
        format: 'umd',
        name: pkg.name,
    }, {//for esm publish
        file: pkg.module,
        format: 'esm',
        name: pkg.name,
    }, {//for test
        file: pkg.main.replace('bin', 'test/src').replace('umd', 'iife'),
        format: 'iife',
        // name for testEnv puppeteer
        name: 'test',
        plugins: [
            del({ targets: ['./test/src/types'], hook: 'writeBundle' })
        ]
    }],
    plugins: [
        del({
            targets: ['./bin', './test/src'],
        }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        uglify(),
    ],
}
