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

const convert = (pattern, { destination = 'output', overwrite }) => {
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
      component.script.findAndRemoveComponents();
      component.script.findAndRemoveEmits();
      component.script.findAndRemoveProps();
      component.script.removeComponentName();
      component.script.removeDoubleSymbols();
      component.script.applyEmits();
      component.script.applyProps();
      component.writeToFile(destination);

      return component;
    });
};

export default convert;
