/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义断点
      screens: {
        fhd: '1920px',
        '4k': '3840px',
        ultra: '11520px'
      },
      // 自定义字母间距
      letterSpacing: {
        custom: '20px',
        'extra-wide': '0.3em'
      }
    }
  },
  plugins: []
}
