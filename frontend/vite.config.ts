import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'



// https://vitejs.dev/config/
export default defineConfig (( ) => {
    const target = process.env.VITE_TARGET
    const isDesktop = target == "desktop"
    console.log(isDesktop)
    return {
        plugins: [react()],
        build: {
            outDir: isDesktop ? './dist-app' : 'dist',
            sourcemap: true,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                'react': path.resolve(__dirname, './node_modules/react'),
                'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            }
        }
    }
})
