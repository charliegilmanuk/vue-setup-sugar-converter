import chalk from 'chalk';

/**
 * Returns script between two specified brackets
 * @param {string} str
 * @param startExp
 * @param startChar
 * @param endChar
 */
const matchScriptBetween = (str, startExp, startChar = '{', endChar = '}') => {
  const startIndex = str.search(startExp);

  if (startIndex > -1) {
    let finishIndex = null;
    let startBracketsCount = 0;
    let endBracketsCount = 0;

    for (let i = startIndex; i < str.length; i++) {
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
      let startOfValue = startIndex + str.match(startExp)[0].length;
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
