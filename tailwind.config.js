const config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx,css,scss}",
  ],
  safelist: [
    "bg-gray-50",
    "text-blue-600",
    "min-h-screen",
    "flex",
    "items-center",
    "justify-center",
    "text-3xl",
    "font-bold"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
