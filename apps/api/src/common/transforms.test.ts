import { describe, expect, it } from 'vitest'
import { resolvePage } from './pagination'
import { toBool, trimString } from './transforms'

describe('toBool', () => {
  it('parses truthy forms', () => {
    expect(toBool(true)).toBe(true)
    expect(toBool('true')).toBe(true)
    expect(toBool('1')).toBe(true)
  })

  it('parses falsy forms', () => {
    expect(toBool(false)).toBe(false)
    expect(toBool('false')).toBe(false)
    expect(toBool('0')).toBe(false)
  })

  it('treats empty string as omit', () => {
    expect(toBool('')).toBeUndefined()
    expect(toBool(undefined)).toBeUndefined()
    expect(toBool('yes')).toBeUndefined()
  })
})

describe('trimString', () => {
  it('trims strings and leaves other values', () => {
    expect(trimString({ value: '  hi  ' })).toBe('hi')
    expect(trimString({ value: 3 })).toBe(3)
  })
})

describe('resolvePage', () => {
  it('applies defaults and clamps', () => {
    expect(resolvePage()).toEqual({ page: 1, limit: 20, skip: 0 })
    expect(resolvePage(2, 10)).toEqual({ page: 2, limit: 10, skip: 10 })
    expect(resolvePage(0, 999)).toEqual({ page: 1, limit: 100, skip: 0 })
  })
})
