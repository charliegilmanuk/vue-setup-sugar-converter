import {
  findAndExtractKey,
  matchInRoot,
  matchScriptBetween,
} from '../lib/StringHelpers.js';
import SFCBlock from './SFCBlock.js';

export default class ScriptBlock extends SFCBlock {
  emits = null;
  props = null;
  components = null;

  get exportIndex() {
    return this.content.indexOf('export default');
  }

  removeComponentName() {
    const rootMatch = matchInRoot(
      /[^a-zA-Z]name:\s?['"].+['"]/gi,
      this.content
    );

    if (rootMatch) {
      const toReplaceExpr = new RegExp(rootMatch.match + ',?\n*?', 'i');
      this.content = this.content.replace(toReplaceExpr, '');
    } else {
      this.content = this.content.replace(/[^a-zA-Z]name:\s?['"].+['"]/i, '');
    }
  }

  findAndRemoveExport() {
    const data = matchScriptBetween(
      this.content,
      new RegExp(/export default.*{/i)
    );

    if (data) {
      let contentParts = data.full.result.split('\n');

      delete contentParts[contentParts.length - 1];
      delete contentParts[0];

      this.content = this.content
        .replace(data.full.result, contentParts.join('\n'))
        .replace(/;\s*[})]?;\s*$/gi, '');
    }
  }

  findAndRemoveSetup() {
    const data = matchScriptBetween(
      this.content,
      new RegExp(/setup\([^)]*\)\s?{/i)
    );

    if (data) {
      let setupWithoutReturn = data.matched.result.replace(
        /return\s?{[^}]*};?[}\s]*$/is,
        ''
      );

      this.content = this.content
        .replace(data.full.result, setupWithoutReturn)
        .replace(/\s,/gi, '');
    }
  }

  findAndRemoveProps() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/[^a-zA-Z]props:\s?{/i),
      startChar: '{',
      endChar: '}',
    });

    if (data) {
      this.props = data.key;
      this.content = data.result;
    } else {
      const propExpr = new RegExp(/[^a-zA-Z]props:\s?(.+),\n?/i);
      const match = this.content.match(propExpr);
      if (match) {
        const [fullMatch, valMatch] = match;

        if (fullMatch && valMatch) {
          this.props = valMatch;
          this.content = this.content.replace(fullMatch, '');
        }
      }
    }
  }

  findAndRemoveEmits() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/[^a-zA-Z]emits:\s?\[/i),
      startChar: '[',
      endChar: ']',
    });

    if (data) {
      this.emits = data.key;
      this.content = data.result;
    } else {
      const emitExpr = new RegExp(/[^a-zA-Z]emits:\s?([^,]+),\n?/i);
      const match = this.content.match(emitExpr);
      if (match) {
        const [fullMatch, valMatch] = match;

        if (fullMatch && valMatch) {
          this.emits = valMatch;
          this.content = this.content.replace(fullMatch, '');
        }
      }
    }
  }

  findAndRemoveComponents() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/[^a-zA-Z]components:\s?{/i),
      startChar: '{',
      endChar: '}',
    });

    if (data) {
      this.components = data.key;
      this.content = data.result;
    }
  }

  findAndRemoveDefineComponent() {
    this.content = this.content
      .replace(/defineComponent,?\s?/i, '')
      .replace(/import {\s*} from .vue.;?/i, '');
  }

  applyEmits() {
    if (this.exportIndex && this.emits) {
      let str = `${
        this.content.search(/emit\(/gi) > -1 ? `const emit = ` : ''
      }defineEmits(${this.emits});\n\n`;
      this.content =
        this.content.substr(0, this.exportIndex) +
        str +
        this.content.substr(this.exportIndex);
    }
  }

  applyProps() {
    if (this.exportIndex && this.props) {
      let str = `${
        this.content.search(/props/gi) > -1 ? `const props = ` : ''
      }defineProps(${this.props});\n\n`;
      this.content =
        this.content.substr(0, this.exportIndex) +
        str +
        this.content.substr(this.exportIndex);
    }
  }

  removeDoubleSymbols() {
    const patterns = [
      [new RegExp(/([,;])\s*[,;]/gi), (group, char) => char],
      [new RegExp(/{\s*,/gi), '{'],
      [new RegExp(/\n{3,}/gi), '\n'],
    ];

    patterns.forEach(symbolSet => {
      const [expr, replace] = symbolSet;
      while (this.content && this.content.search(expr) > -1) {
        this.content = this.content.replace(expr, replace);
      }
    });

    this.content = this.content.trim().replace(/\s\);?$/, '\n');
  }
}
