# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

# Environment Variables

The application uses environment variables for API keys. Create a `.env` file in the root directory with the following variables:

```
VITE_STADIA_API_KEY=your_stadia_api_key
VITE_THUNDERFOREST_API_KEY=your_thunderforest_api_key
```

A template file `.env.example` is provided for reference. Never commit your actual API keys to the repository.

# Directory Structure Update

The project's directory structure has been reorganized for better organization:

## Vue Components
- All Vue components are now in the `src/components/` directory
- Screen components are in `src/components/screens/`
- Interface tabs are in `src/components/tabs/`
- Form components are in `src/components/forms/`
- Individual components like ItemCard, MonsterCard, etc. are directly in `src/components/`

This organization helps keep related files together and improves the maintainability of the codebase.
