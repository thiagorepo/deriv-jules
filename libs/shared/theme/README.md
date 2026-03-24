# @org/theme

The `theme` package provides React context providers and logic for applying dynamic styles like primary colors directly into the CSS DOM.

## Usage
Wrap applications or sub-trees in `<ThemeProvider initialTheme={tenantConfig}>` to automatically override global Tailwind defaults (`--primary`) and apply them universally to all descendants.
