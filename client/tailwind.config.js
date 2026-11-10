import daisyui from 'daisyui';

export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx}'
    ],

    theme: {
        extend: {
            colors: {
                mochi: '#00B894',
                mint: '#A7F3D0',
                blush: '#FFB6C1'
            },

            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui']
            }
        }
    },

    plugins: [daisyui],

    daisyui: {
        themes: ['light', 'dark']
    }
};