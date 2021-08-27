# vue-setup-sugar-converter

This CLI tool will automatically and recursively convert your existing Vue 3 composition API single file components (SFC) to the new `<script setup>` syntax available in Vue 3.2+.  I have tested this successfully on over 200 components in a large production project (hence the reason for this tool)!

To read more about Vue 3.2 and performance improvements see:  <https://blog.vuejs.org/posts/vue-3.2.html>

Documentation for SFC `<script setup>`:  <https://v3.vuejs.org/api/sfc-script-setup.html#basic-syntax>

Example:

![](https://i.imgur.com/Kw9Esxa.png)

I strongly recommend using source control and committing changes before running any commands.

# Installation

```bash
npm i -g vue-setup-sugar-converter
```

# Usage

To recursively convert all components in the `src/` folder:
```bash
vue-setup-sugar convert 'src/**/*'
```

![](https://i.imgur.com/za2B7o8.png)

By default, these components will be saved to `./output/` with the respective folder structures and names kept intact.

To configure the output folder, use the `-d --destination` argument, for example:

```bash
vue-setup-sugar convert 'src/**/*' -d 'converted/'
```

Please note the speech marks used above as without them the behaviour gets a bit strange, this is passed to a glob function.  Specifying `.vue` is not required (anything without a `.vue` extension is ignored).

You could probably set the output directory to the same as the input but obviously this will be destructive, I would recommend outputting to a separate directory then checking each of the components before copying to the source.

### (Smart) Features

- Skips components already using the new syntax
- Removes `defineComponent` and its associated Vue import automatically
- Intelligently declares `defineEmits`/`defineProps` as a variable depending on whether they're used in the script or not (no unused vars)
- Reformat output using ESLint/Prettier by default, you're free to reformat using your own ESLint configuration afterwards

## Limitations

These are mostly down to not having any components to use as test cases (or general 3.2+ changes) so feel free to provide some:

- ❌ Components **must** be in composition API format already, it cannot convert from options API
- ❌ TypeScript components are not tested and are unlikely to work
- ❌ Any objects in the default exported object other than `name/components/props/emits/setup()` may break the conversion, for example `serverPrefetch`, these could be supported by popular request
- ❗ If your components use a name attribute that's different to the file name, any parent's references to that child may break as the `components` object doesn't exist with the new format 
- ❗ Any methods/properties that are exposed to a parent should now be [explicitly declared using `defineExpose`](https://v3.vuejs.org/api/sfc-script-setup.html#defineexpose)
- ❗ Must manually add [useSlots and useAttrs](https://v3.vuejs.org/api/sfc-script-setup.html#useslots-and-useattrs) if you use them in the script (pretty uncommon)

## Finishing Up

👍 A special thanks to the npm package [vue-sfc-parser](https://www.npmjs.com/package/vue-sfc-parser) as that solved the parsing of the template/script/style blocks quite quickly.

☕☕  If this tool helped you in any way, [donations would be hugely appreciated](https://www.buymeacoffee.com/charliegilman) as I'm currently buying our first house and saving for a wedding!

Appreciate any feedback, hoping this will be flawless after updates.