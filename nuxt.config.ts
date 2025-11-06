import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    modules: [
        "@nuxt/eslint",
        "shadcn-nuxt",
        "@vueuse/nuxt",
        "@nuxtjs/color-mode",
        "@nuxt/icon",
        "@nuxtjs/leaflet",
    ],

    ssr: false,

    eslint: {
        config: {
            stylistic: true,
        },
    },

    css: ["~/assets/css/tailwind.css"],
    vite: {
        plugins: [
            tailwindcss(),
        ],
        server: {
            allowedHosts: ["private.knoter.eu"],
        },
    },

    colorMode: {
        classSuffix: "",
    },

    nitro: {
        rollupConfig: {
            output: {
                manualChunks: undefined,
            },
        },
    },

})
