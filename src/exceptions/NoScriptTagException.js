import chalk from 'chalk';

export default sourcePath => {
  console.log(
    chalk.yellow(`Skipping ${sourcePath} as there is no script tag defined.`)
  );
};
