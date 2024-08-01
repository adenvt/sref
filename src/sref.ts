/* eslint-disable @typescript-eslint/promise-function-async */
type Watch<T> = (fn: WatchHandler<T>, opts?: WatchOptions) => UnWatch

type WatchHandler<T> = (value: T, oldValue?: T) => void | Promise<void>

type Matcher<T> = (value: T, oldValue?: T) => boolean | Promise<boolean>

type UnWatch = () => void

interface WatchOptions {
  immediate?: boolean,
}

interface SMatch<T> {
  /**
   * Wait until value match
   * @param matcher
   */
  toMatch: (matcher: Matcher<T>) => Promise<void>,
  /**
   * Wait until value equal
   * @param expectValue expected value
   */
  toBe: (expectValue: T) => Promise<void>,
}

function sMatch<T = any> (watch: Watch<T>, isNot = false): SMatch<T> {
  return Object.freeze<SMatch<T>>({
    toMatch (matcher) {
      return new Promise<void>((resolve) => {
        const unWatch = watch(async (value, oldValue) => {
          if (await matcher(value, oldValue) !== isNot) {
            unWatch()
            resolve()
          }
        }, { immediate: true })
      })
    },
    toBe (expectValue) {
      return this.toMatch((value) => value === expectValue)
    },
  })
}

export interface SRef <T> extends SMatch<T> {
  /**
   * The value
   */
  value: T,
  /**
   * Add on change listener
   * @param fn on change handler
   */
  watch: (fn: WatchHandler<T>, opts?: WatchOptions) => UnWatch,

  get not (): SMatch<T>,
}

/**
 * Super small, bare minimum reactive variable
 *
 * @param initialValue initial value
 * @example
 *
 * const data    = sRef()
 * const isReady = sRef(false)
 *
 * fetch('https://jsonplaceholder.typicode.com/todos/1')
 *   .then((r) => r.json())
 *   .then((json) => {
 *     data.value    = json
 *     isReady.value = true
 *   })
 *
 * ;(async () => {
 *   await isReady.toBe(true)
 *
 *   console.log(data.value) // data is now ready!
 * })()
 */
function sRef<T = any> (): SRef<T | undefined>
function sRef<T = any> (initialValue: T): SRef<T>
function sRef<T> (initialValue?: T): SRef<T | undefined> {
  const watchers = new Set<WatchHandler<T>>()

  let value    = initialValue as T
  let oldValue = value

  const watch = (fn: WatchHandler<T>, opts: WatchOptions = {}): UnWatch => {
    watchers.add(fn)

    if (opts.immediate)
      void fn(value)

    return () => {
      watchers.delete(fn)
    }
  }

  const match    = sMatch<any>(watch)
  const notMatch = sMatch<any>(watch, true)

  return Object.freeze<SRef<T | undefined>>({
    get value () {
      return value
    },

    set value (newValue) {
      if (value !== newValue) {
        value = newValue

        for (const emit of watchers)
          void emit(value, oldValue)

        oldValue = value
      }
    },

    watch,
    ...match,

    get not () {
      return notMatch
    },
  })
}

export default sRef
