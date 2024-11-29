import { defineConfig } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolver from "@rollup/plugin-node-resolve";
import image from "@rollup/plugin-image"; // for import image
import json from "@rollup/plugin-json"; // for import json
import replace from "@rollup/plugin-replace"; // replace define object
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript"; // @rollup/plugin-swc
import { dts } from "rollup-plugin-dts";

// for css
import url from "postcss-url";
import postcss from "rollup-plugin-postcss";

const isProd = process.env.BUILD === "production";
const input = "./src/index.ts";
const extensions = ['.js', '.ts'];

export function createRollupConfig(options = {}) {
    const {
        // alias: moduleAlias, //
        // input
        output = [],
        defineObject = {},
        external = [],
        globals = {},
        plugins = [],
        pkg,
    } = options;
    const date = new Date().toDateString();
    const banner = `/**
    * ${pkg.name} v${pkg.version} build ${date}
    * ${pkg.homepage}
    * Copyright ${date.slice(-4)} ${pkg.author}
    * @license ${pkg.license}
    */`;

    /**
     * @type {import('rollup').RollupOptions}
     */
    const config = [
        // browser-friendly UMD build

        // CommonJS (for Node) and ES module (for bundlers) build.
        // (We could have three entries in the configuration array
        // instead of two, but it's quicker to generate multiple
        // builds from a single configuration where possible, using
        // an array for the `output` option, where we can specify
        // `file` and `format` for each target)
        {
            input,
            // logLevel: "silent",
            onwarn: (warning, next) => {
                // ignore some warn and log message.
                if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "EVAL") {
                    return;
                } // you can do this now btw
                next(warning);
            },
            plugins: [
                defineObject &&
                replace({
                    preventAssignment: true,
                    values: defineObject,
                }),
                json(),
                image(),
                resolver({
                    browser: true,
                    mainFields: ["browser", "module", "main"],
                    extensions
                }),
                commonjs(),
                postcss({
                    minimize: true,
                    autoModules: false,
                    plugins: [
                        url({
                            url: "inline",
                        }),
                    ],
                    extensions: [".css", ".scss"],
                    use: {
                        stylus: {},
                        less: {},
                        sass: {
                            silenceDeprecations: ["legacy-js-api"],
                        },
                    },
                }),
                typescript({
                    tsconfig: "tsconfig.json",
                    sourceMap: !isProd,
                    // 临时解决方案
                    // declarationDir和rollup的output会有冲突所以这里暂时不生成declaration用tsc生成datatype
                    // declaration: false,
                    // emitDeclarationOnly: false,
                    // outDir: undefined,
                    // declarationDir: undefined,
                }),
                ...plugins,
                isProd && terser(),
            ],
            external,
            output: [
                {
                    file: pkg.main,
                    format: "umd",
                    name: pascalCase(getPackageName(pkg.name)),
                    banner,
                    globals,
                },
                {
                    file: pkg.module,
                    sourcemap: !isProd,
                    format: "esm",
                    banner,
                    globals,
                },
                ...output,
            ],
        },
    ];
    return defineConfig(config);
}

function dashToCamelCase(myStr) {
    return myStr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toUpperCase(myStr) {
    return `${myStr.charAt(0).toUpperCase()}${myStr.substr(1)}`;
}

function pascalCase(myStr) {
    return toUpperCase(dashToCamelCase(myStr));
}

function getPackageName(rawPackageName) {
    const scopeEnd = rawPackageName.indexOf("/") + 1;
    return rawPackageName.substring(scopeEnd);
}
