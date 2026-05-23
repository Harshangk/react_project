const THEME_STORAGE_KEY = "theme";

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

export function getPreferredTheme() {
    if (!isBrowser()) return "light";

    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "dark" || storedTheme === "light") {
            return storedTheme;
        }
    } catch (error) {
        console.warn("Unable to read theme preference", error);
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getCurrentTheme() {
    if (!isBrowser()) return "light";

    const activeTheme =
        document.documentElement.dataset.theme ||
        document.body.dataset.theme;

    if (activeTheme === "dark" || activeTheme === "light") {
        return activeTheme;
    }

    return getPreferredTheme();
}

export function applyTheme(theme) {
    if (!isBrowser()) return "light";

    const nextTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
    document.body.dataset.theme = nextTheme;
    document.body.classList.toggle("dark", nextTheme === "dark");
    document.body.classList.toggle("light", nextTheme === "light");

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute("content", nextTheme === "dark" ? "#0b1120" : "#f6f8fb");
    }

    return nextTheme;
}

export function toggleTheme() {
    return saveTheme(getCurrentTheme() === "dark" ? "light" : "dark");
}

export function saveTheme(theme) {
    const nextTheme = applyTheme(theme);

    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
        console.warn("Unable to save theme preference", error);
    }

    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));

    return nextTheme;
}
