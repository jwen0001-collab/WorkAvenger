export const getAssetPath = (path: string) => {
    const baseUrl = import.meta.env.BASE_URL;
    // If baseUrl is './', we want './path'.
    // If baseUrl is '/repo/', we want '/repo/path'.
    // Avoid double slashes if path starts with /.
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    if (baseUrl === './') {
        return `./${cleanPath}`;
    }

    // Create absolute path if baseUrl is absolute path
    return `${baseUrl}${cleanPath}`;
};
