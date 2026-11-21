import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import siteImages from './plugins/site-images.js'

// GitHub Pages (served from /<repository-name>/): npm run build -- --base=./
// A relative base works for any repository name; see README.md → GitHub Pages.
export default defineConfig({ plugins: [react(), siteImages()] })
