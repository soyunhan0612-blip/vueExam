export function debounce(fn, wait) {
  let timerId

  function debounced(...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      timerId = undefined
      fn.apply(this, args)
    }, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timerId)
    timerId = undefined
  }

  return debounced
}
