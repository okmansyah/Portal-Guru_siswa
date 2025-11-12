/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Pastikan versi daisyui@4

  // Konfigurasi DaisyUI
  daisyui: {
    themes: [
      {
        // === TEMA KUSTOM DENGAN LATAR BELAKANG GELAP ===
        mySchoolTheme: {
          // Warna Primer, Sekunder, Aksen tetap sama untuk konsistensi
          primary: "#10B981", // Hijau
          "primary-focus": "#059669",
          secondary: "#8B5CF6", // Ungu
          "secondary-focus": "#7C3AED",
          accent: "#EF4444", // Merah
          "accent-focus": "#DC2626",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",

          // --- INI PERUBAHAN UTAMANYA UNTUK TEMA GELAP ---
          "base-100": "#1F2937", // Latar belakang KARTU (Abu-abu gelap untuk kontras)
          "base-200": "#111827", // Latar belakang HALAMAN (Abu-abu sangat gelap, mendekati hitam)
          "base-300": "#374151", // Abu-abu lebih terang (untuk hover, dll)
          neutral: "#6B7280", // Warna netral (abu-abu sedang)

          "base-content": "#D1D5DB", // Teks default (putih/abu-abu terang agar terbaca)
          "neutral-content": "#ffffff", // Teks di atas warna netral

          // Properti bentuk
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.25rem",
        },
      },
      // Anda bisa tetap menyertakan tema light/dark default jika ingin opsi berganti tema
      // "light",
      // "dark", // Ini adalah tema dark default DaisyUI
    ],
    // Atur tema default (dan darkTheme) ke tema kustom kita
    darkTheme: "mySchoolTheme",
  },
};
