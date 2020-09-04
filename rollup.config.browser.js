import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';

const name = 'brain';
const extensions = ['.mjs', '.js', '.json', '.node', '.ts'];

export default {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en#external-e-external
  // external: ['gpu.js'],

  plugins: [
    // Allows node_modules resolution
    resolve({
      preferBuiltins: true,
      browser: true,
      extensions,
    }),

    // Allows the node builtins to be required/imported.
    globals(),
    builtins(),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    // Compile TypeScript/JavaScript files
    babel({
      extensions,
      babelHelpers: 'bundled',
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
