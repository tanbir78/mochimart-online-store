
import daisyui from 'daisyui';

export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx}'
    ],

    theme: {
        extend: {
            colors: {
                mochi: '#F28C28',
                orange: {
                    light: '#FFE8CC',
                    DEFAULT: '#F28C28',
                    dark: '#D97706'
                },
                midnight: '#171512',
                surface: {
                    light: '#FFFFFF',
                    dark: '#26211B'
                },
                cream: '#FFF9F2',
                muted: {
                    light: '#81766D',
                    dark: '#B9ADA0'
                }
            },

            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui']
            }
        }
    },

    plugins: [daisyui],

    daisyui: {
        themes: [
            {
                light: {
                    'color-scheme': 'light',
                    primary: '#F28C28',
                    'primary-content': '#FFFFFF',
                    secondary: '#FFE8CC',
                    'secondary-content': '#29231F',
                    accent: '#D97706',
                    neutral: '#29231F',
                    'neutral-content': '#FFF9F2',
                    'base-100': '#FFF9F2',
                    'base-200': '#F5EDE3',
                    'base-300': '#E8DCCF',
                    'base-content': '#29231F',
                    info: '#3B82F6',
                    success: '#16A34A',
                    warning: '#EAB308',
                    error: '#DC2626'
                }
            },
            {
                dark: {
                    'color-scheme': 'dark',
                    primary: '#FFA640',
                    'primary-content': '#292016',
                    secondary: '#3B2C1E',
                    'secondary-content': '#FFF7ED',
                    accent: '#F28C28',
                    neutral: '#26211B',
                    'neutral-content': '#FFF7ED',
                    'base-100': '#171512',
                    'base-200': '#211C17',
                    'base-300': '#40352A',
                    'base-content': '#FFF7ED',
                    info: '#60A5FA',
                    success: '#4ADE80',
                    warning: '#FACC15',
                    error: '#F87171'
                }
            }
        ]
    }
};
