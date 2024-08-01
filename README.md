# sRef

> Super small, bare minimum reactive variable

## Installation

```sh
# NPM
npm install sref --save

# Yarn
yarn add sref
```

## Usage

### Watching value changed

```ts
import sRef from 'sref'

const text = sRef('')

text.watch((value) => {
  console.log('Got new value: "%s"', value)
})

text.value = 'Hello World'

// Got new value: "Hello World"
```

### Wait for some async data to be ready

```ts
import sRef from 'sref'

const data    = sRef()
const isReady = sRef(false)

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then((r) => r.json())
  .then((json) => {
    data.value    = json
    isReady.value = true
  })

;(async () => {
  await isReady.toBe(true)

  console.log(data.value) // data is now ready!
})()
```

### More examples

```ts
import sRef from 'sref'

const data = sRef(5)

await data.toMatch((value) => typeof value === 'number')
await data.toBe(5)

await data.toMatch((value) => Number.isNaN(value))
await data.not.toBe(0)
```

## License

[MIT License](./LICENSE)
