import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'



// https://vitejs.dev/config/
export default defineConfig (( ) => {
    const isDesktop = process.env.VITE_TARGET == "desktop"
    console.log(isDesktop)

    return {
        plugins: [react()],
        base: "./",
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
