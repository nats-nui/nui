import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'



// https://vitejs.dev/config/
export default defineConfig (({ command, target }) => {
    const isDesktop = target == "desktop"
    return {
        plugins: [react()],
        build: {
            outDir: isDesktop ? '../nui-desktop/frontend/dist' : 'dist',
            sourcemap: true,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        }
    }
})
