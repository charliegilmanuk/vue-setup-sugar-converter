import chalk from 'chalk';
import glob from 'glob';
import Component from './models/Component.js';
import NoInputException from './exceptions/NoInputException.js';

const getVueFiles = pattern => {
  if (!pattern) {
    throw NoInputException();
  }
  const allSFC = glob
    .sync(pattern)
    .filter(filePath => filePath.search(/\.vue/gi) > -1);

  console.log(chalk.blue(`Found ${allSFC.length} Vue SFCs using input`));

  return allSFC;
};

const convert = (pattern, { destination = 'output' }) => {
  getVueFiles(pattern)
    .map(sourcePath => new Component(sourcePath))
    .filter(c => {
      const skip = c.isConverted || !c.script;

      if (skip) {
        console.log(
          chalk.yellow(
            `Skipping ${c.sourcePath} as it appears to be using the new syntax already or the script tag is empty.`
          )
        );
      }

      return !skip;
    })
    .map(component => {
      const { script, sourcePath } = component;

      try {
        script.findAndRemoveComponents();
        script.findAndRemoveEmits();
        script.findAndRemoveProps();
        script.removeDoubleSymbols();
        script.applyEmits();
        script.applyProps();
        script.removeComponentName();
        script.findAndRemoveExport();
        script.findAndRemoveSetup();
        script.removeDoubleSymbols();
        script.findAndRemoveDefineComponent();

        try {
          component.writeToFile(destination);
          component.lintFile(destination);
        } catch (err) {
          console.log(
            chalk.red(
              `Error saving/linting ${sourcePath}, conversion completed but could not save: `,
              err
            )
          );
        }
      } catch (err) {
        console.log(chalk.red(`Error converting ${sourcePath}: `, err));
      }

      return component;
    });
};

export default convert;
