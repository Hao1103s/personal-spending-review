import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f3ef",
        foreground: "#171717",
        card: "#fbf9f7",
        muted: "#ece5dc",
        border: "#ddd2c5",
        primary: "#1f4f46",
        accent: "#b96839",
        success: "#2f7b4a",
        warning: "#a86424",
        danger: "#a53d2f",
        chart: {
          dining: "#c06b37",
          travel: "#3d7a7a",
          housing: "#7666b1",
          shopping: "#b54867",
          entertainment: "#7a8441",
          medical: "#5a95c8",
          study: "#b38b3f",
          social: "#c0563a",
          subscription: "#4e5bc3",
          other: "#7e7c75",
        },
      },
      fontFamily: {
        sans: [
          "\"Avenir Next\"",
          "\"SF Pro Display\"",
          "\"PingFang SC\"",
          "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"",
          "ui-sans-serif",
          "sans-serif",
        ],
        mono: [
          "\"JetBrains Mono\"",
          "\"SFMono-Regular\"",
          "ui-monospace",
          "monospace",
        ],
      },
      boxShadow: {
        panel: "0 16px 40px rgba(56, 36, 16, 0.08)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      backgroundImage: {
        "page-gradient":
          "radial-gradient(circle at top left, rgba(185, 104, 57, 0.14), transparent 32%), radial-gradient(circle at top right, rgba(31, 79, 70, 0.12), transparent 30%)",
      },
    },
  },
  plugins: [],
};

export default config;
