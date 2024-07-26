type WatchHandler<T> = (value: T, oldValue?: T) => void | Promise<void>

type Matcher<T> = (value: T, oldValue?: T) => boolean | Promise<boolean>

type UnWatch = () => void

interface WatchOptions {
  immediate?: boolean,
}

export interface SRef <T> {
  /**
   * The value
   */
  value: T,
  /**
   * Add on change listener
   * @param fn on change handler
   */
  watch: (fn: WatchHandler<T>, opts?: WatchOptions) => UnWatch,
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

  let value: T = initialValue as T

  return {
    get value () {
      return value
    },

    set value (newValue) {
      const oldValue = value

      value = newValue

      // emit on-change
      for (const emit of watchers)
        void emit(value, oldValue)
    },

    watch (fn, opts = {}): UnWatch {
      watchers.add(fn)

      if (opts.immediate)
        void fn(value)

      return () => {
        watchers.delete(fn)
      }
    },

    async toMatch (matcher) {
      return await new Promise<void>((resolve) => {
        const unWatch = this.watch(async (value, oldValue) => {
          if (await matcher(value, oldValue)) {
            unWatch()
            resolve()
          }
        }, { immediate: true })
      })
    },

    async toBe (expectValue) {
      return await this.toMatch((value) => value === expectValue)
    },
  }
}

export default sRef
