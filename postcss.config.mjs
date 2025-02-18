/** @type {import('postcss-load-config').Config} */
const config = {
  image: {
    remotePatterns: [
      {
        protcol: "https",
        hostname: "xxxx.supabase.co",
      },
    ],
  },
  plugins: {
    tailwindcss: {},
  },
};

export default config;
