import {
  vi,
  it,
  describe,
  expect,
} from 'vitest'
import sRef from './sref'
import { delay } from 'nanodelay'

describe('.watch()', () => {
  it('should able value changed', () => {
    const count = sRef(0)
    const log   = vi.fn()

    count.watch((value, oldValue) => {
      log(value, oldValue, count.value)
    })

    count.value = 5

    expect(log).toBeCalledTimes(1)
    expect(log).toBeCalledWith(5, 0, 5)
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

  it('should emit changed if immidiate set to true', () => {
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
    await delay(0)

    count.value++
    await delay(0)

    expect(match.value).toBe(false)

    count.value++
    await delay(0)

    expect(match.value).toBe(true)
  })

  it('should resolve immidiately if current value match expected value', async () => {
    const count = sRef(5)
    const match = sRef(false)

    count.toBe(5).then(() => { match.value = true })
    await delay(0)

    expect(match.value).toBe(true)
  })
})
