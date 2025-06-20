import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        coverage: {
            reporter: ['html'],
            reportsDirectory: '../documentation/static/coverage',
        }
    }
})