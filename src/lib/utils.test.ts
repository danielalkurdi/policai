import { describe, it, expect } from 'vitest'
import { cn, cleanHtmlContent, extractJsonFromResponse } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('deduplicates tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})

describe('cleanHtmlContent', () => {
  it('strips HTML tags', () => {
    expect(cleanHtmlContent('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('removes script tags and content', () => {
    expect(cleanHtmlContent('<p>text</p><script>alert("xss")</script>')).toBe('text')
  })

  it('removes style tags and content', () => {
    expect(cleanHtmlContent('<style>.a{color:red}</style><p>text</p>')).toBe('text')
  })

  it('collapses whitespace', () => {
    expect(cleanHtmlContent('<p>  hello   world  </p>')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(cleanHtmlContent('')).toBe('')
  })
})

describe('extractJsonFromResponse', () => {
  it('extracts JSON from plain JSON string', () => {
    const result = extractJsonFromResponse('{"key": "value"}', {})
    expect(result).toEqual({ key: 'value' })
  })

  it('extracts JSON surrounded by prose', () => {
    const text = 'Here is the result:\n{"score": 0.8, "relevant": true}\nEnd of response.'
    const result = extractJsonFromResponse(text, { score: 0, relevant: false })
    expect(result).toEqual({ score: 0.8, relevant: true })
  })

  it('returns fallback for invalid JSON', () => {
    const fallback = { default: true }
    expect(extractJsonFromResponse('no json here', fallback)).toEqual(fallback)
  })

  it('returns fallback for empty string', () => {
    const fallback = { empty: true }
    expect(extractJsonFromResponse('', fallback)).toEqual(fallback)
  })
})
