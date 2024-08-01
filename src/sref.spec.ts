import {
  vi,
  it,
  describe,
  expect,
} from 'vitest'
import sRef from './sref'

const nextTick = async () => await new Promise((resolve) => setTimeout(resolve))

describe('.watch()', () => {
  it('should able to watch value changed', () => {
    const count = sRef(0)
    const log   = vi.fn()

    count.watch((value, oldValue) => {
      log(value, oldValue, count.value)
    })

    count.value = 5

    expect(log).toBeCalledTimes(1)
    expect(log).toBeCalledWith(5, 0, 5)
  })

  it('should not trigger change when set with same value', () => {
    const count = sRef(0)
    const log   = vi.fn()

    count.watch((value, oldValue) => {
      log(value, oldValue, count.value)
    })

    count.value = 5

    expect(log).toBeCalledTimes(1)
    expect(log).toBeCalledWith(5, 0, 5)

    count.value = 5

    expect(log).toBeCalledTimes(1)
  })

  it('should able to unwatch', () => {
    const count = sRef(0)
    const log   = vi.fn()

    const unWatch = count.watch((value, oldValue) => {
      log(value, oldValue, count.value)
    })

    unWatch()

    count.value = 5

    expect(log).not.toBeCalled()
  })

  it('should emit changed if immediate set to true', () => {
    const count = sRef(0)
    const log   = vi.fn()

    count.watch((value, oldValue) => {
      log(value, oldValue, count.value)
    }, { immediate: true })

    expect(log).toBeCalled()
    expect(log).toBeCalledWith(0, undefined, 0)
  })
})

describe('.toBe()', () => {
  it('should resolve promise when value match expected value', async () => {
    const count = sRef(0)
    const match = sRef(false)

    count.toBe(2).then(() => { match.value = true })
    await nextTick()

    count.value++
    await nextTick()

    expect(match.value).toBe(false)

    count.value++
    await nextTick()

    expect(match.value).toBe(true)
  })

  it('should resolve immediately if current value match expected value', async () => {
    const count = sRef(5)
    const match = sRef(false)

    count.toBe(5).then(() => { match.value = true })
    await nextTick()

    expect(match.value).toBe(true)
  })
})

describe('.not', () => {
  it('should resolve if value not match', async () => {
    const count = sRef(0)
    const match = sRef(false)

    count.not.toBe(0).then(() => { match.value = true })
    await nextTick()

    expect(match.value).toBe(false)

    count.value++
    await nextTick()

    expect(match.value).toBe(true)
  })
})
