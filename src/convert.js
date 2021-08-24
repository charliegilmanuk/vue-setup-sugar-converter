import chalk from 'chalk';
import glob from 'glob';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { parseComponent } from 'vue-sfc-parser';

const convert = (pattern, {destination, overwrite}) => {
    if (!pattern) {
        console.log(chalk.red('You must specify files to convert, you may use glob patterns or single file names, e.g. `convert .src/**`'));
        return;
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
        const { script, template, style } = component;
        let result = script.content.trim();

        [findAndRemoveComponents, findAndRemoveEmits, findAndRemoveProps].forEach(fn => {
            const replaceResult = fn(result);
            if (replaceResult) {
                result = replaceResult.result;
                Object.assign(component, replaceResult);
            }
        });

        // This would also replace names in nested objects, NOT GOOD
        result = result.replace(/[^a-zA-Z]name:\s?['"].+['"]/gi, '');

        result = removeDoubleSymbols(result);
        result = insertEmits(result, component.emits);
        result = insertProps(result, component.props);

        component.result =
            reconstructSFCBlock(template, 'template') +
            reconstructSFCBlock(result, 'script', { setup: true }) +
            reconstructSFCBlock(style, 'style');

        return component;
    });

    let successfulWrites = [];
    let failedWrites = [];

    components.forEach(component => {
        const { result, sourcePath } = component;

        const outputFile = path.join('output', sourcePath);
        try {
            fse.outputFileSync(outputFile, result);
            console.log(chalk.green(`Successfully wrote file to ${outputFile}`))
            successfulWrites.push(outputFile);
        } catch (err) {
            console.log(chalk.red(`Failed to write ${outputFile}`));
            console.error(chalk.red(err));
            failedWrites.push(outputFile);
        }
    });

    console.log();
    console.log(chalk.bgGreen(`${successfulWrites.length} of ${components.length} files successfully converted!`));
    if (failedWrites.length) {
        console.log(chalk.bgYellow(`${failedWrites.length} files failed`, failedWrites));
    }
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
        const { script, styles, template } = component;
        if (script) {
            return {
                sourcePath,
                script,
                template,
                style: styles ? styles[0] : null,
                isConverted: script.content.search(/<script.*setup.*>/gi) > -1
            }
        } else {
            console.log(chalk.yellow(`Skipping ${sourcePath} as there is no script tag defined.`));
        }
    }).filter(x => !!x);
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
    });
}

const findAndRemoveDefaultExport = script => {
    return findAndExtractKey(script, 'export', {
        startExp: new RegExp(/export default.*{/gi),
        startChar: '{', endChar: '}'
    });
}

const removeDoubleSymbols = str => {
    const patterns = [
        [new RegExp(/([,;])\s*[,;]/gi), (group, char) => char],
        [new RegExp(/{\s*,/gi), '{'],
    ];

    patterns.forEach(symbolSet => {
        const [expr, replace] = symbolSet;
        while (str && str.search(expr) > -1) {
            str = str.replace(expr, replace);
        }
    });

    return str;
}

const reconstructSFCBlock = (block, tag, extraAttrs = {}) => {
    let str = '';

    if (block) {
        const { attrs, content } = block;
        str = `<${tag}`;
        if (attrs && Object.keys(attrs).length) {
            Object.keys(attrs).forEach(key => {
                str += ` ${key}`;
                if (attrs[key] !== true) {
                    str += `="${attrs[key]}"`
                }
            })
        }
        str += `>${content}</${tag}>`;
    }

    return str.length ? `${str}\n\n` : '';
}

const insertProps = (script, props) => {
    const exportIndex = script.indexOf('export default');
    if (exportIndex && props) {
        return script.substr(0, exportIndex) +
            `const props = defineProps(${props});\n\n` +
            script.substr(exportIndex);
    }
    return script;
};

const insertEmits = (script, emits) => {
    const exportIndex = script.indexOf('export default');
    if (exportIndex && emits) {
        return script.substr(0, exportIndex) +
            `const emit = defineEmits(${emits});\n\n` +
            script.substr(exportIndex);
    }
    return script;
};

export default convert;