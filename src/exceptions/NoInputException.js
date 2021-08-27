import chalk from 'chalk';

export default () => {
  console.log(
    chalk.red(
      'You must specify files to convert, you may use glob patterns or single file names, e.g. `convert ./src/**`'
    )
  );
};
