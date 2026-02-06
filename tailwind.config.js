/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                kindleBg: '#fbfaf8',
                kindleText: '#1a1a1a',
            }
        },
    },
    plugins: [],
}