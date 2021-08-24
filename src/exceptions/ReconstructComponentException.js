import chalk from 'chalk';

export default sourcePath => {
  console.log(
    chalk.red(
      `Failed to reconstruct ${sourcePath}, most likely bad syntax, skipping...`
    )
  );
};
