/**
 * Prettier configuration for React + TypeScript + Tailwind CSS project
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    // Use the Tailwind CSS plugin for better class sorting
    plugins: ['prettier-plugin-tailwindcss'],

    // Use single quotes for consistency
    singleQuote: true,

    // No semicolons (cleaner code style)
    semi: false,

    // 2 spaces for indentation (React/TS standard)
    tabWidth: 4,
    useTabs: false,

    // Trailing commas for better git diffs
    trailingComma: 'es5',

    // Line length (80 is Prettier default, adjust as needed)
    printWidth: 80,

    // JSX formatting
    jsxSingleQuote: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',

    // End of line handling
    endOfLine: 'lf',

    // Embedded language formatting
    embeddedLanguageFormatting: 'auto',

    // File-specific overrides
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
}

export default config