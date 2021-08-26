import fs from 'fs';
import { parseComponent } from 'vue-sfc-parser';
import { ESLint } from 'eslint';
import baseConfig from '../../.eslintrc.cjs';
const eslint = new ESLint({
  fix: true,
  baseConfig: baseConfig,
  ignore: false,
});
import ScriptBlock from './ScriptBlock.js';
import TemplateBlock from './TemplateBlock.js';
import StyleBlock from './StyleBlock.js';
import fse from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import ReconstructComponentException from '../exceptions/ReconstructComponentException.js';
const __dirname = path.resolve();

export default class Component {
  sourcePath = null;
  script = null;
  template = null;
  style = null;
  isConverted = false;
  props = null;
  emits = null;

  constructor(sourcePath) {
    this.sourcePath = sourcePath;

    const rawCode = fs.readFileSync(sourcePath, 'utf-8');
    const { script, styles, template } = parseComponent(rawCode);

    if (template) this.template = new TemplateBlock(template);
    if (styles && styles[0]) this.style = new StyleBlock(styles[0]);
    if (script) {
      this.script = new ScriptBlock(script);
      this.isConverted = script.attrs && script.attrs.setup;
    }
  }

  get name() {
    const segments = this.sourcePath.split('/');
    return segments[segments.length - 1];
  }

  reconstructSFC() {
    let str = '';

    if (this.template && this.template.content.trim()) {
      str += this.template.getOutput();
    }
    if (this.script && this.script.content.trim().length > 3) {
      str += this.script.getOutput({ setup: true });
    }
    if (this.style && this.style.content.trim()) {
      str += this.style.getOutput();
    }

    return str;
  }

  writeToFile(dir) {
    const { sourcePath } = this;

    const outputFile = path.join(__dirname, dir, sourcePath);

    try {
      let data = null;
      try {
        data = this.reconstructSFC();
      } catch (err) {
        console.log(err);
        throw ReconstructComponentException(sourcePath);
      }
      fse.outputFileSync(outputFile, data);
      console.log(chalk.green(`Successfully wrote file to ${outputFile}`));
    } catch (err) {
      console.log(chalk.red(`Failed to write ${outputFile}`));
      console.error(chalk.red(err));
    }
  }

  async lintFile(dir) {
    const outputFile = path.join(__dirname, dir, this.sourcePath);

    const results = await eslint.lintFiles(outputFile);

    await ESLint.outputFixes(results);
  }
}
