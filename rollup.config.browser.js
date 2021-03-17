import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const name = 'brain';
const extensions = ['.mjs', '.js', '.json', '.node', '.ts'];

export default {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en#external-e-external
  external: ['stream'],

  plugins: [
    // Allows node_modules resolution
    resolve({
      preferBuiltins: true,
      browser: true,
      extensions,
    }),

    // allow json importing
    json(),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    // Compile TypeScript/JavaScript files
    typescript(),
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
