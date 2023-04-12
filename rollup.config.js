import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as pkg from './package.json';

const extensions = ['.js', '.json', '.node', '.ts'];

export default {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en#external-e-external
  external: [
    'gpu.js'
  ],

  plugins: [
    // Allows node_modules resolution
    resolve({
      preferBuiltins: true,
      browser: false,
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
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
};
