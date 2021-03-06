// vim: set ft=javascript fdm=marker et ff=unix tw=80 sw=2:

import path from 'path'
import babel from 'rollup-plugin-babel'

import babelrc from './.babelrc'
import { version, name, author, license, description, dependencies } from './package.json'

const banner = (name, short = false) => {
  let s;
  if (short) {
    s = `/*! ${name} v${version} | ${license} licensed | ${author} */`
  } else {
    s = `/*
 * ${name} v${version} - ${description}
 *
 * @author ${author}
 * Released under the ${license} license.
 */`
  }
  return s
}

const resolve = p => path.resolve(__dirname, '.', p)
const plugins = [
  babel,
  'resolve',
  'commonjs'
]

export default {
  destDir: resolve('lib'),
  dependencies,
  pluginOptions: {
    babel (rollupCfg) {
      const cfg = {
        ...babelrc,
        babelrc: false,
        externalHelpers: false,
        runtimeHelpers: false
      }
      cfg.plugins.forEach((o, i) => {
        const name = typeof o === 'string' ? o : o[0]
        if (o === 'transform-es2015-modules-commonjs') cfg.plugins.splice(i, 1)
      })
      return cfg
    }
  },
  entry: [
    {
      input: resolve('src/sha1.js'),
      plugins,
      output: [
        { format: 'umd', name: 'SHA1', file: 'sha1.js', banner: banner(name) },
        { format: 'es', file: 'sha1.esm.js', banner: banner(name, true) } ]
    }
  ]
}
