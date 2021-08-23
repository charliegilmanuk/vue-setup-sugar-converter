import chalk from 'chalk';
import glob from 'glob';
import fs from 'fs';
import { parseComponent } from 'vue-sfc-parser';

const convert = (pattern, { destination, overwrite }) => {
    if (!pattern) {
        console.log(chalk.red('You must specify files to convert, you may use glob patterns or single file names, e.g. `convert .src/**`'));
    }

    const allFiles = glob.sync(pattern);
    let allSFC = allFiles.filter(file => file.search(/\.vue/gi) > -1);

    console.log(chalk.blue(`Found ${allFiles.filter(file => file.search(/\.vue/gi) > -1).length} Vue SFCs using input`));

    const components = parseComponents(allSFC);
};

/**
 * Parse an array of paths to objects containing component code
 * @param paths
 * @returns {[sourcePath: string, rawCode: string, script: string, template: string]}
 */
const parseComponents = paths => {
    return paths.map(sourcePath => {
        const rawCode = fs.readFileSync(sourcePath, 'utf-8');
        const component = parseComponent(rawCode);
        return {
            sourcePath,
            rawCode,
            script: component.script.content.trim(),
            template: component.template.content.trim(),
        }
    });
}

export default convert;