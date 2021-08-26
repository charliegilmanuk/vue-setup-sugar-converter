import chalk from 'chalk';

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
      const matchIndex = body.search(match);
      if (matchIndex >= startIndex && matchIndex <= finishIndex) {
        for (let i = startIndex; i <= matchIndex; i++) {
          if (body[i] === '{') bracketOpenCount++;
          if (body[i] === '}') bracketCloseCount++;
        }
      }

      if (bracketOpenCount === bracketCloseCount) {
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
 * @param {string} str
 * @param startExp
 * @param startChar
 * @param endChar
 */
export const matchScriptBetween = (
  str,
  startExp,
  startChar = '{',
  endChar = '}'
) => {
  const match = str.match(startExp);

  if (match) {
    const matchLength = match[0].length;
    const startIndex = str.search(startExp);
    let finishIndex = null;
    let startBracketsCount = 0;
    let endBracketsCount = 0;

    for (let i = startIndex + matchLength - 1; i < str.length; i++) {
      if (!finishIndex) {
        if (str[i] === startChar) startBracketsCount++;
        if (str[i] === endChar) {
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
          result: str.substr(
            startIndex,
            finishIndex - startIndex + startChar.length
          ),
          start: startIndex,
          finish: finishIndex,
        },
        matched: {
          result: str.substr(startOfValue, finishIndex - startOfValue),
          start: startOfValue,
          finish: finishIndex,
        },
      };
    }
  }

  return null;
};

export const findAndExtractKey = (str, options) => {
  const search = matchScriptBetween(
    str,
    options.startExp,
    options.startChar || undefined,
    options.endChar || undefined
  );

  if (search) {
    return {
      key: options.startChar + search.matched.result + options.endChar,
      result: str.replace(search.full.result, ''),
    };
  }

  return null;
};
