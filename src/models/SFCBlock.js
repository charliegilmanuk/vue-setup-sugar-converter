import SFCParser from 'vue-sfc-parser';
const BaseSFCBlock = SFCParser.SFCBlock;

export default class SFCBlock extends BaseSFCBlock {
  getOutput(extraAttrs = {}) {
    let output = '';

    if (this && this.content) {
      const { content, type } = this;
      const attrs = { ...this.attrs, ...extraAttrs };
      output = `<${type}`;
      if (attrs && Object.keys(attrs).length) {
        Object.keys(attrs).forEach(key => {
          output += ` ${key}`;
          if (attrs[key] !== true) {
            output += `="${attrs[key]}"`;
          }
        });
      }
      output += `>\n${content}</${type}>`;
    }

    if (output.length) {
      output += '\n\n';
    }

    return output;
  }
}
