import { camelCase } from 'change-case'

export const kebabToCamel = (str: any) => /.+-.+/.test(str) ? camelCase(str) : str

export const isPlainObject = (value: any) => Object.prototype.toString.call(value).slice(8, -1) === 'Object'
