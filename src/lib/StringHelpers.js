import chalk from 'chalk';

/**
 * Matches the given expression at a zero indentation level
 * @param {RegExp} strToMatch
 * @param {string} body
 * @param {number} [startIndex=0]
 * @param {number} [finishIndex]
 * @returns {null|{index: number, length: number, match: string}}
 */
export const matchInRoot = (
  strToMatch,
  body,
  startIndex = 0,
  finishIndex = null
) => {
  if (!finishIndex) {
    finishIndex = body.length - 1;
  }
  const context = body.substr(startIndex, finishIndex - startIndex);
  const matches = context.match(strToMatch);

  let result = null;

  if (matches) {
    matches.forEach(match => {
      let bracketOpenCount = 0;
      let bracketCloseCount = 0;
      const matchIndex = body.search(
        match.replace(/[()]/gi, group => '\\' + group)
      );
      let searched = '';
      if (matchIndex >= startIndex && matchIndex <= finishIndex) {
        for (let i = startIndex; i <= matchIndex; i++) {
          if (body[i] === '{') bracketOpenCount++;
          if (body[i] === '}') bracketCloseCount++;
          searched += body[i];
        }
      }

      if (
        bracketOpenCount === bracketCloseCount ||
        (searched.search('export default') > -1 &&
          bracketOpenCount === bracketCloseCount + 1)
      ) {
        result = {
          index: matchIndex,
          length: match.length,
          match,
        };
      }
    });
  }

  return result;
};

/**
 * Returns script between two specified brackets
 * @param {string} body
 * @param {RegExp} startExp Start of matched expression, e.g. to match the props object use /props:\s?{/
 * @param {string} [startChar={]
 * @param {string} [endChar=}]
 */
export const matchScriptBetween = (
  body,
  startExp,
  startChar = '{',
  endChar = '}'
) => {
  const match = body.match(startExp);

  if (match) {
    const matchLength = match[0].length;
    const startIndex = body.search(startExp);
    let finishIndex = null;
    let startBracketsCount = 0;
    let endBracketsCount = 0;

    for (let i = startIndex + matchLength - 1; i < body.length; i++) {
      if (!finishIndex) {
        if (body[i] === startChar) startBracketsCount++;
        if (body[i] === endChar) {
          endBracketsCount++;
          if (endBracketsCount === startBracketsCount) {
            finishIndex = i;
          }
        }
      }
    }

    if (!finishIndex) {
      console.log(
        chalk.red(
          `Found start of expression in script but could not find an end`
        )
      );
      return null;
    } else {
      let startOfValue = startIndex + matchLength;
      return {
        full: {
          result: body.substr(
            startIndex,
            finishIndex - startIndex + startChar.length
          ),
          start: startIndex,
          finish: finishIndex,
        },
        matched: {
          result: body.substr(startOfValue, finishIndex - startOfValue),
          start: startOfValue,
          finish: finishIndex,
        },
      };
    }
  }

  return null;
};

/**
 * Helper method basically used to simplify the matchScriptBetween method calls
 * @param body
 * @param {{startExp: RegExp, startChar: string, endChar: string}} options
 * @returns {null|{result: string, key: string}}
 */
export const findAndExtractKey = (body, options) => {
  const search = matchScriptBetween(
    body,
    options.startExp,
    options.startChar || undefined,
    options.endChar || undefined
  );

  if (search) {
    return {
      key: options.startChar + search.matched.result + options.endChar,
      result: body.replace(search.full.result, ''),
    };
  }

  return null;
};
