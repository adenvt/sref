import {
  vi,
  it,
  expect,
} from 'vitest'
import sRef from './sref'
import { delay } from 'nanodelay'

it('should able to set & get value', () => {
  const isLoading = sRef(false)

  isLoading.value = true

  expect(isLoading.value).toBe(true)
})

it('should able watch & unwatch value changed', () => {
  const isLoading = sRef(false)
  const onChange  = vi.fn()
  const unWatch   = isLoading.watch(onChange)

  isLoading.value = true

  expect(isLoading.value).toBe(true)
  expect(onChange).toBeCalledTimes(1)
  expect(onChange).toBeCalledWith(true, false)

  unWatch()

  isLoading.value = false

  expect(isLoading.value).toBe(false)
  expect(onChange).toBeCalledTimes(1)
})

it('should able to waiting for value change toBe', async () => {
  const count = sRef(0)

  let done = false

  count.toBe(3).then(() => { done = true })
  await delay(0)

  count.value++
  await delay(0)

  expect(done).toBe(false)

  count.value++
  await delay(0)

  expect(done).toBe(false)

  count.value++
  await delay(0)

  expect(done).toBe(true)
})
