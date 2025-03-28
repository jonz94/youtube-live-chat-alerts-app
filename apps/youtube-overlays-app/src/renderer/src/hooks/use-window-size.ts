import * as React from 'react'

interface WindowSize {
  /**
   * the current width of the window, in pixels.
   */
  width: number

  /**
   * the current height of the window, in pixels.
   */
  height: number
}

/**
 * the `useWindowSize()` hook is a useful for retrieving and tracking the dimensions of the browser window within a React component.
 * it attaches an event listener to the “resize” event, ensuring that the size is updated dynamically whenever the window is resized
 * the hook returns the `WindowSize` object, enabling components to access and utilize the window dimensions for various purposes,
 * such as responsive layout adjustments, conditional rendering, or calculations based on the available space.
 *
 * @returns returns an object with the current width and height of the window, in pixels.
 *
 * @credits this implementation is adapted from ui.dev's usehooks library
 * @see {@link https://usehooks.com/usewindowsize}
 * @see {@link https://github.com/uidotdev/usehooks/blob/90fbbb4cc085e74e50c36a62a5759a40c62bb98e/index.js#L1344-L1367}
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = React.useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  React.useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
