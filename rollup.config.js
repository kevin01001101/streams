import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/js/app.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  context: 'window',
  plugins: [resolve(), commonjs()],
  watch: {
    clearScreen: false  
  }
};

/*
commonjs({
    namedExports: {
      'quill': ['Quill']
    }
  }),
  */