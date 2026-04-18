import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    joi: 'src/adapters/joi.ts',
    yup: 'src/adapters/yup.ts',
    zod: 'src/adapters/zod.ts',
    'class-validator': 'src/adapters/class-validator.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
  splitting: false
})
