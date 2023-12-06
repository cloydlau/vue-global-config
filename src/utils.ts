import { camelCase } from 'change-case'

export const kebabToCamel = (str: any) => /.+-.+/.test(str) ? camelCase(str) : str
