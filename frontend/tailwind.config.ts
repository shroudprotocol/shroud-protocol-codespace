import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0D0E12', // A very dark, near-black for the main background
        'surface': '#171921',   // A slightly lighter dark for card backgrounds, inputs
        'primary': '#6366F1',   // A nice indigo for primary buttons and accents
        'primary-hover': '#4F46E5', // A darker shade for hover states
        'secondary': '#3A3D4A', // For secondary buttons or borders
        'text-primary': '#F0F2F8',  // A bright, off-white for main text
        'text-secondary': '#A8AEC1', // A muted gray for subtitles and placeholder text
        'success': '#10B981', // Green for success messages
        'error': '#EF4444',   // Red for error messages
      },
    },
  },
  plugins: [],
};
export default config;