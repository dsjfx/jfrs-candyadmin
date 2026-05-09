
const CODE_BL = 'BL';
const CODE_CA = 'CA';
const CODE_TA = 'TA';
const CODE_CO = 'CO';
const CODE_AU = 'AU';

const PREFIX: Record<string, string> = {
  [CODE_BL]: 'blog',
  [CODE_CA]: 'category',
  [CODE_TA]: 'tag',
  [CODE_CO]: 'comment',
  [CODE_AU]: 'auth',
}

function makeUrl(code: string, url: string = ''): string {
  return `/${PREFIX[code]}${url}`
}

export {
  CODE_BL,
  CODE_CA,
  CODE_TA,
  CODE_CO,
  CODE_AU,

  makeUrl
}