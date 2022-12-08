import { describe, expect, it } from 'vitest'
import conclude from '../src/conclude'

describe('conclude', () => {
  describe('非plain object', () => {
    it('常规', () => {
      expect(conclude([1, undefined, undefined])).toEqual(1)
      expect(conclude([undefined, 2, undefined])).toEqual(2)
      expect(conclude([undefined, undefined, 3])).toEqual(3)
    })
    it('必填', () => {
      expect(() => {
        conclude([undefined, undefined, undefined], {
          required: true,
        })
      }).toThrow()
    })
    it('单个类型', () => {
      expect(() => {
        conclude([1], {
          type: String,
        })
      }).toThrow()
    })
    it('多个类型', () => {
      expect(conclude([1], {
        type: [String, Number],
      })).toEqual(1)
      expect(() => {
        conclude([{}], {
          type: [String, Number],
        })
      }).toThrow()
    })
    it('自定义校验器', () => {
      expect(conclude([1], {
        validator: prop => prop === 1,
      })).toEqual(1)
      expect(() => {
        conclude([1], {
          validator: prop => prop === 2,
        })
      }).toThrow()
    })
  })

  describe('plain object', () => {
    it('深合并', () => {
      expect(conclude([{
        a: {
          a: 1,
        },
        $b: 2,
        _b: 2,
      }, {
        a: {
          a: 2,
          b: 1,
        },
      }, undefined])).toEqual({
        a: {
          a: 1,
          b: 1,
        },
        $b: 2,
        _b: 2,
      })
    })
    it('深合并 仅作用于default', () => {
      expect(conclude([{
        a: {
          a: 1,
        },
      }, {
        a: {
          a: 2,
          b: 1,
        },
      }, undefined], {
        default: {
          a: {
            c: 3,
          },
        },
        mergeObjectApplyOnlyToDefault: true,
      })).toEqual({
        a: {
          a: 1,
          c: 3,
        },
      })
    })
    it('浅合并', () => {
      expect(conclude([{
        a: {
          a: 1,
        },
      }, {
        b: {
          a: 2,
          b: 1,
        },
      }, undefined], {
        mergeObject: 'shallow',
      })).toEqual({
        a: {
          a: 1,
        },
        b: {
          a: 2,
          b: 1,
        },
      })
    })
    it('覆盖', () => {
      expect(conclude([{
        a: {
          a: 1,
        },
      }, {
        b: {
          a: 2,
          b: 1,
        },
      }, undefined], {
        mergeObject: false,
      })).toEqual({
        a: {
          a: 1,
        },
      })
    })
    it('动态生成默认值', () => {
      expect(conclude([{
        a: {
          a: 1,
        },
      }, {
        a: {
          a: 2,
          b: 1,
        },
      }], {
        default: userProp => ({
          a: {
            c: userProp.a.a === 1 ? 1 : null,
          },
        }),
        defaultIsDynamic: true,
      })).toEqual({
        a: {
          a: 1,
          b: 1,
          c: 1,
        },
      })
    })
    it('对象键转驼峰（浅层）', () => {
      expect(conclude([{
        'a-b': {
          'b-a': 1,
        },
      }], {
        camelizeObjectKeys: true,
      })).toEqual({
        aB: {
          'b-a': 1,
        },
      })
      expect(conclude([{
        'a-b': {
          'b-a': 1,
        },
      }])).toEqual({
        'a-b': {
          'b-a': 1,
        },
      })
      expect(conclude([{
        'a-b': {
          'b-a': 1,
        },
        'aB': 1,
      }], {
        camelizeObjectKeys: true,
      })).toEqual({
        aB: 1,
      })
    })
    it('合并function', () => {
      expect(conclude([
        () => 1,
        () => 2,
      ], {
        default: () => 3,
        mergeFunction: (accumulator, item) => () => {
          return (accumulator() ?? 0) + (item?.() ?? 0)
        },
        mergeFunctionApplyOnlyToDefault: false,
      })()).toEqual(6)
    })
    it('合并function 仅作用于default', () => {
      expect(conclude([
        () => 1,
        () => 2,
      ], {
        default: () => 3,
        mergeFunction: (accumulator, item) => () => {
          return (accumulator() ?? 0) + (item?.() ?? 0)
        },
      })()).toEqual(4)
    })
    it('同时合并对象和函数', () => {
      const FINAL_PROP = conclude([
        { onChange: () => 1 },
        undefined,
        { a: 1 },
      ], {
        default: { onChange: () => 3 },
        mergeFunction: (accumulator, item) => () => {
          return (accumulator() ?? 0) + (item?.() ?? 0)
        },
      })
      expect(FINAL_PROP.onChange()).toEqual(4)
      expect(FINAL_PROP.a).toEqual(1)
    })
    it('驼峰和短横线并存', () => {
      expect(conclude([{ 'aB': 1, 'a-b': 2 }, { 'a-b': 4, 'aB': 3 }], {
        camelizeObjectKeys: true,
      })).toEqual({ aB: 2 })
      expect(conclude([{ 'aB': 1, 'a-b': 2 }], {
        camelizeObjectKeys: true,
        default: (userProp: any) => {
          expect(userProp).toEqual({ aB: 2 })
        },
        defaultIsDynamic: true,
      })).toEqual({ aB: 2 })
    })
  })
})
