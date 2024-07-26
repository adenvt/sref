type WatchHandler<T> = (value: T) => void | Promise<void>

type Matcher<T> = (value: T | undefined) => boolean | Promise<boolean>

type UnWatch = () => void

export interface SRef <T> {
  /**
   * The value
   */
  value: T,
  /**
   * Add on change listener
   * @param fn on change handler
   */
  watch: (fn: WatchHandler<T>) => UnWatch,
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
 * Reactive variable
 *
 * @param initialValue initial value
 * @example
 *
 * const isBusy = sRef(false)
 *
 * function onClick () {
 *    // Wait other tobe done
 *    if (isBusy.value)
 *      await isBusy.toBe(false)
 *
 *    isBusy.value = true
 *
 *    // Heavy async function
 *    setTimeout(() => {
 *      isBusy.value = false
 *    },5000)
 * }
 */
function sRef<T = any> (): SRef<T | undefined>
function sRef<T = any> (initialValue: T): SRef<T>
function sRef<T> (initialValue?: T): SRef<T | undefined> {
  const watcher = new Set<WatchHandler<T>>()

  let value: T | undefined = initialValue

  return {
    get value (): T | undefined {
      return value
    },

    set value (newValue: T) {
      value = newValue

      // emit on-change
      for (const emit of watcher)
        void emit(newValue)
    },

    watch (fn: WatchHandler<T>): UnWatch {
      watcher.add(fn)

      return () => {
        watcher.delete(fn)
      }
    },

    async toMatch (matcher: Matcher<T>) {
      return await new Promise<void>((resolve) => {
        const unWatch = this.watch(async (value) => {
          if (await matcher(value)) {
            unWatch()
            resolve()
          }
        })
      })
    },

    async toBe (expectValue: T | undefined) {
      return await this.toMatch((value) => value === expectValue)
    },
  }
}

export default sRef
