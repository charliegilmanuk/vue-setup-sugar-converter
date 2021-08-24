import { findAndExtractKey } from '../lib/StringHelpers.js';
import SFCBlock from './SFCBlock.js';

export default class ScriptBlock extends SFCBlock {
  emits = null;
  props = null;
  components = null;

  get exportIndex() {
    return this.content.indexOf('export default');
  }

  removeComponentName() {
    // TODO: this would also replace names in nested objects, NOT GOOD
    this.content = this.content.replace(/[^a-zA-Z]name:\s?['"].+['"]/gi, '');
  }

  findAndRemoveProps() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/props:\s?{/gi),
      startChar: '{',
      endChar: '}',
    });

    if (data) {
      this.props = data.key;
      this.content = data.result;
    }
  }

  findAndRemoveEmits() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/emits:\s?\[/gi),
      startChar: '[',
      endChar: ']',
    });

    if (data) {
      this.emits = data.key;
      this.content = data.result;
    }
  }

  findAndRemoveComponents() {
    const data = findAndExtractKey(this.content, {
      startExp: new RegExp(/components:\s?{/gi),
      startChar: '{',
      endChar: '}',
    });

    if (data) {
      this.components = data.key;
      this.content = data.result;
    }
  }

  applyEmits() {
    if (this.exportIndex && this.emits) {
      this.content =
        this.content.substr(0, this.exportIndex) +
        `const emit = defineEmits(${this.emits});\n\n` +
        this.content.substr(this.exportIndex);
    }
  }

  applyProps() {
    if (this.exportIndex && this.props) {
      return (
        this.content.substr(0, this.exportIndex) +
        `const props = defineProps(${this.props});\n\n` +
        this.content.substr(this.exportIndex)
      );
    }
  }

  removeDoubleSymbols() {
    const patterns = [
      [new RegExp(/([,;])\s*[,;]/gi), (group, char) => char],
      [new RegExp(/{\s*,/gi), '{'],
    ];

    patterns.forEach(symbolSet => {
      const [expr, replace] = symbolSet;
      while (this.content && this.content.search(expr) > -1) {
        this.content = this.content.replace(expr, replace);
      }
    });
  }
}
