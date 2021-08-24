import fs from 'fs';
import { parseComponent } from 'vue-sfc-parser';
import NoScriptTagException from '../exceptions/NoScriptTagException.js';
import ScriptBlock from './ScriptBlock.js';
import TemplateBlock from './TemplateBlock.js';
import StyleBlock from './StyleBlock.js';
import fse from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import ReconstructComponentException from '../exceptions/ReconstructComponentException.js';

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
    const component = parseComponent(rawCode);
    const { script, styles, template } = component;

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

    if (this.template) str += this.template.getOutput();
    if (this.script) str += this.script.getOutput({ setup: true });
    if (this.style) str += this.style.getOutput();

    return str;
  }

  writeToFile(dir) {
    const { sourcePath } = this;

    const outputFile = path.join(dir, sourcePath);

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
}
