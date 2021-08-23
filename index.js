#! /usr/bin/env node
import { program } from 'commander';
import convert from './src/convert.js';

program
    .command('convert [files]')
    .description('Convert specified Vue 3 composition components to Vue 3.2+ script setup sugar')
    .option('-d, --destination <directory>', 'The directory to output the converted components to, the folder structure of the components will be kept intact, defaults to ./<this package name>')
    .option('-o, --overwrite', 'Ignores the destination and overwrites the specified files in place, make sure you\'re using source control!')
    .action(convert);

program.parse();