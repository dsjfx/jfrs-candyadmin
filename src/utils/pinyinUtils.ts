import { pinyin } from 'pinyin-pro';

/**
 * 获取汉字的首字母
 * @param text 
 * @returns 
 */
export const getFirstLetter = (text: string) => {
  return pinyin(text, { pattern: 'first', toneType: 'none' }).replace(/ /g, '');
};

/**
 * 获取汉字的字母全拼，使用传入的分隔符连接
 * @param text 
 * @param sepa 
 * @returns 
 */
export const getFullLetter = (text: string, sepa: string = '') => {
  return pinyin(text, {
    toneType: 'none',
    type: 'string',
    separator: sepa,
  })
}

/**
 * 获取汉字的字母全拼，以连字符(-)连接
 * @param text 
 * @returns 
 */
export const getFullLetterWithHyphen = (text: string) => {
  return getFullLetter(text, '-');
}