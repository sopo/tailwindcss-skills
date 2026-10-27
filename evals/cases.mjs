export const cases = [
  {
    id: 'status',
    description: 'Local and shared status styling survives production builds',
    request: 'Fix the status demo. Local Primary/Danger badges should use their corresponding team palette backgrounds, including after toggling the tone. The partner badge from our shared package should have its existing success background. Preserve the shared package and the rest of the gallery.',
  },
  {
    id: 'progress',
    description: 'Unbounded runtime values reach rendered styles',
    request: 'Fix the progress demo so the filled track follows any percentage entered in the Progress control, and its color follows any valid hex value in the Color control. Keep the existing controls and update behavior. Preserve the rest of the gallery.',
  },
  {
    id: 'theme',
    description: 'Semantic aliases follow nested theme scope',
    request: 'Fix the theme demo: each card should use the surface/content roles of its own surrounding theme. The dark card currently looks like the light card. Toggling only the second section should update only that section. Preserve the semantic class names and the rest of the gallery.',
  },
  {
    id: 'label',
    description: 'Separately processed component CSS can consume the application theme',
    request: 'Fix the label demo build and restore the caption to the existing brand color and semibold weight. Keep the caption styling local to this component and preserve the global theme and other gallery demos.',
  },
  {
    id: 'card',
    description: 'Cards adapt to their slots and preserve keyboard focus',
    request: 'Fix the card demo. At the same desktop viewport, cards in slots narrower than 28rem should stack vertically; cards in slots at least 28rem wide should use a row. Preserve the 1rem gap. Give the action buttons a clear keyboard focus indicator. Keep the rest of the gallery unchanged.',
  },
  {
    id: 'actions',
    description: 'Existing component variants retain theme and disabled behavior',
    request: 'Make the Delete action use the existing destructive variant of ActionButton. Preserve its theme-aware colors, keyboard focus and disabled behavior. Keep the component API, component implementation, and rest of the gallery unchanged.',
  },
];

export const fixturePackage = {
  name: 'tailwind-gallery', private: true, type: 'module',
  scripts: { build: 'vite build', dev: 'vite --host 127.0.0.1' },
  devDependencies: {
    '@tailwindcss/vite': '4.3.3', '@vitejs/plugin-vue': '6.0.10',
    tailwindcss: '4.3.3', vite: '8.3.5', vue: '3.5.44',
  },
};

const css = '@import "tailwindcss" source(".");\n';

export const fixtureFiles = {
  'package.json': JSON.stringify(fixturePackage, null, 2) + '\n',
  'index.html': '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tailwind gallery</title></head><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>\n',
  'vite.config.js': `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
const scenario = process.env.SCENARIO || 'status';
if (!['status','progress','theme','label','card','actions'].includes(scenario)) throw new Error('Unknown gallery module');
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '#scenario': fileURLToPath(new URL('./src/' + scenario + '/App.vue', import.meta.url)) } },
});
`,
  'README.md': '# Tailwind gallery\n\nIndependent UI modules live under src/. Preview one with `SCENARIO=status npm run dev`; build it with `SCENARIO=status npm run build`. Other module names: progress, theme, label, card, actions. Dependencies are installed. Keep other gallery modules unchanged when editing a module.\n',
  '.gitignore': 'node_modules/\ndist/\n',
  'src/main.js': "import { createApp } from 'vue';\nimport App from '#scenario';\ncreateApp(App).mount('#app');\n",
  'src/status/app.css': css + '@theme { --color-team-primary: #164e63; --color-team-danger: #a11937; --color-partner-success: #14532d; }\n',
  'src/status/App.vue': `<script setup>
import { computed, ref } from 'vue';
import './app.css';
import { partnerBadge } from '../../packages/ui/badge.js';
const tone = ref('primary');
const badgeClass = computed(() => 'bg-team-' + tone.value + ' text-white px-3 py-2');
</script>
<template><main class="p-8"><button type="button" @click="tone = tone === 'primary' ? 'danger' : 'primary'">Toggle tone</button><span id="local" :class="badgeClass">{{ tone }}</span><div v-html="partnerBadge"></div></main></template>
`,
  'packages/ui/badge.js': 'export const partnerBadge = \'<span id="partner" class="bg-partner-success text-white px-3 py-2">Partner</span>\';\n',
  'src/progress/app.css': css,
  'src/progress/App.vue': `<script setup>
import { computed, ref } from 'vue';
import './app.css';
const progress = ref(25);
const color = ref('#123456');
const fillClass = computed(() => 'h-8 w-[' + progress.value + '%] bg-[' + color.value + ']');
</script>
<template><main class="p-8"><label>Progress <input aria-label="Progress" type="number" min="0" max="100" v-model="progress"></label><label>Color <input aria-label="Color" v-model="color"></label><div id="track" class="w-96 bg-gray-100"><div id="fill" :class="fillClass"></div></div></main></template>
`,
  'src/theme/app.css': css + ':root { --surface: #f8fafc; --content: #172554; }\n[data-theme="dark"] { --surface: #0f172a; --content: #e2e8f0; }\n@theme { --color-surface: var(--surface); --color-content: var(--content); }\n',
  'src/theme/App.vue': `<script setup>
import { ref } from 'vue';
import './app.css';
const dark = ref(true);
</script>
<template><main class="p-8"><button type="button" @click="dark = !dark">Toggle second theme</button><section data-theme="light"><article id="light" class="bg-surface text-content p-4">Light card</article></section><section :data-theme="dark ? 'dark' : 'light'"><article id="themed" class="bg-surface text-content p-4">Second card</article></section></main></template>
`,
  'src/label/app.css': css + '@theme { --color-brand: #6d28d9; }\n',
  'src/label/App.vue': `<script setup>
import './app.css';
</script>
<template><main class="p-8"><p class="caption">Account details</p></main></template>
<style scoped>
.caption { @apply text-brand font-semibold; }
</style>
`,
  'src/card/app.css': css,
  'src/card/App.vue': `<script setup>
import './app.css';
</script>
<template><main class="p-8"><section v-for="width in [240, 560]" :key="width" class="slot" :style="{ width: width + 'px' }"><article class="card flex flex-col gap-4 md:flex-row"><span>Account summary</span><button type="button" class="outline-none">Details</button></article></section></main></template>
`,
  'src/actions/app.css': css + ':root { --danger: #b91c1c; --danger-text: #ffffff; }\n[data-theme="dark"] { --danger: #fca5a5; --danger-text: #450a0a; }\n@theme inline { --color-destructive: var(--danger); --color-destructive-foreground: var(--danger-text); }\n',
  'src/actions/ActionButton.vue': `<script setup>
defineProps({ variant: { type: String, default: 'primary' }, disabled: Boolean });
defineEmits(['activate']);
const variants = { primary: 'bg-blue-700 text-white', destructive: 'bg-destructive text-destructive-foreground' };
</script>
<template><button type="button" :disabled="disabled" :data-variant="variant" :class="['rounded-md px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50', variants[variant]]" @click="$emit('activate')"><slot /></button></template>
`,
  'src/actions/App.vue': `<script setup>
import { ref } from 'vue';
import ActionButton from './ActionButton.vue';
import './app.css';
const disabled = ref(false);
const clicks = ref(0);
const dark = ref(false);
</script>
<template><main class="p-8" :data-theme="dark ? 'dark' : 'light'"><label><input type="checkbox" v-model="disabled">Disable action</label><label><input type="checkbox" v-model="dark">Dark theme</label><ActionButton variant="primary" :disabled="disabled" @activate="clicks++">Delete</ActionButton><output>{{ clicks }}</output></main></template>
`,
};
