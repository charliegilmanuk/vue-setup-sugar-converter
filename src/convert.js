import chalk from 'chalk';
import glob from 'glob';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { parseComponent } from 'vue-sfc-parser';

const convert = (pattern, {destination, overwrite}) => {
    if (!pattern) {
        console.log(chalk.red('You must specify files to convert, you may use glob patterns or single file names, e.g. `convert .src/**`'));
    }

    const allFiles = glob.sync(pattern);
    let allSFC = allFiles.filter(file => file.search(/\.vue/gi) > -1);

    console.log(chalk.blue(`Found ${allFiles.filter(file => file.search(/\.vue/gi) > -1).length} Vue SFCs using input`));

    let rawComponents = parseComponents(allSFC);
    let alreadyConvertedCount = rawComponents.filter(c => c.isConverted).length;

    if (alreadyConvertedCount) {
        console.log(chalk.blue(`Excluded ${alreadyConvertedCount} components as they appeared to have the <script setup> tag already`));
    }

    const components = rawComponents.filter(x => !x.isConverted).map(component => {
        const { script } = component;
        let result = script;

        [findAndRemoveComponents, findAndRemoveEmits, findAndRemoveProps].forEach(fn => {
            const replaceResult = fn(result);
            if (replaceResult) {
                Object.assign(component, replaceResult);
            }
        });

        const doubleCommaExpr = new RegExp(/,\s*,/gi);
        while (result.search(doubleCommaExpr) > -1) {
            result = result.replace(doubleCommaExpr, ',');
        }

        component.result = result;

        return component;
    });

    components.forEach(component => {
        const { result, sourcePath } = component;

        const outputFile = path.join('output', sourcePath);
        fse.outputFileSync(outputFile, result);
    });
};

/**
 * Parse an array of paths to objects containing component code
 * @param {string[]} paths
 * @returns {{template: string, rawCode: string, sourcePath: *, script: string}[]}
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
            isConverted: component.script.content.trim().search(/<script.*setup.*>/gi) > -1
        }
    });
}

/**
 * Returns script between two specified brackets
 * @param {string} script
 * @param {{startExp: RegExp, startChar: string, endChar: string }} options
 */
const matchScriptBetween = (script, options = {
    startExp, startChar: '{', endChar: '}'
}) => {
    const { startExp, startChar, endChar } = options;
    const startIndex = script.search(startExp);

    if (startIndex > -1) {
        let finishIndex = null;
        let startBracketsCount = 0;
        let endBracketsCount = 0;

        for (let i = startIndex; i < script.length; i++) {
            if (!finishIndex) {
                if (script[i] === startChar) startBracketsCount++;
                if (script[i] === endChar) {
                    endBracketsCount++;
                    if (endBracketsCount === startBracketsCount) {
                        finishIndex = i;
                    }
                }
            }
        }

        if (!finishIndex) {
            console.log(chalk.red(`Found start of expression in script but could not find an end`));
            return null;
        } else {
            let startOfValue = startIndex + script.match(startExp)[0].length;
            return {
                full: {
                    result: script.substr(startIndex, (finishIndex - startIndex) + startChar.length),
                    start: startIndex,
                    finish: finishIndex
                },
                matched: {
                    result: script.substr(startOfValue, finishIndex - startOfValue),
                    start: startOfValue,
                    finish: finishIndex,
                }
            }
        }
    }

    return null;
}

const findAndExtractKey = (script, key, options) => {
    const search = matchScriptBetween(script, options);

    if (search) {
        return {
            [key]: options.startChar + search.matched.result + options.endChar,
            result: script.replace(search.full.result, '')
        };
    }

    return null;
}

const findAndRemoveProps = (script) => {
    return findAndExtractKey(script, 'props', {
        startExp: new RegExp(/props:\s?{/gi),
        startChar: '{', endChar: '}'
    });
}

const findAndRemoveEmits = (script) => {
    return findAndExtractKey(script, 'emits', {
        startExp: new RegExp(/emits:\s?\[/gi),
        startChar: '[',
        endChar: ']',
    });
}

const findAndRemoveComponents = script => {
    return findAndExtractKey(script, 'components', {
        startExp: new RegExp(/components:\s?{/gi),
        startChar: '{', endChar: '}'
    })
}

export default convert;