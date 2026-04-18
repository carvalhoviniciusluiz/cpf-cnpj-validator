import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/joi.ts', 'src/yup.ts', 'src/zod.ts', 'src/class-validator.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
  splitting: false
})
