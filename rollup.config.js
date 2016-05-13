import nodeResolve from "rollup-plugin-node-resolve"
import buble from "rollup-plugin-buble"

export default {
  entry: "src/VuexValidator.js",
  format: "umd",
  moduleName: "VuexValidator",
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    buble()
  ],
  dest: "lib/VuexValidator.js",
  sourceMap: true
}
