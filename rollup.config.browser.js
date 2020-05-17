import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';

const name = 'brain';

export default {
  input: './src/index.js',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en#external-e-external
  external: [],

  plugins: [
    // Allows node_modules resolution
    resolve({ preferBuiltins: true, browser: true }),

    // allow json importing
    json(),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    // Allows the node builtins to be required/imported.
    globals(),
    builtins(),

    // compile typescript
    typescript({
      tsconfig: './tsconfig.build.json',
    }),

    // Compile TypeScript/JavaScript files
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      include: ['src/**/*'],
    }),
  ],

  output: [
    {
      file: 'dist/brain-browser.mjs',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/brain-browser.js',
      format: 'umd',
      name,
      sourcemap: true,
    },
    {
      file: 'dist/brain-browser.min.js',
      format: 'umd',
      name,
      sourcemap: true,
      plugins: [
        // Minify bundles
        terser(),
      ],
    },
  ],
};
