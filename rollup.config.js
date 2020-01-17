import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/js/app.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [resolve()],
  watch: {
    clearScreen: false  
  }
};