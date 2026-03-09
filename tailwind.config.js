/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.{html,ts}'
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#E5E4E2',
                'silver': '#E5E4E2',
                'charcoal': '#121212',
                'accent-purple': '#2B1B3D',
                'background-dark': '#121212',
            },
            fontFamily: {
                'display': ['Manrope', 'sans-serif'],
                'serif': ['Cormorant Garamond', 'serif'],
                'outfit': ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'DEFAULT': '0.25rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                'full': '9999px',
            },
        },
    },
    plugins: [],
};
