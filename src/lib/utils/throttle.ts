/**
 * Creates a throttled function that only invokes func at most once per wait milliseconds.
 * The function is invoked with the last arguments provided to the throttled function.
 */
export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void | Promise<void>,
  wait: number
): (...args: Args) => void {
  let lastInvokeTime: number | null = null;
  let lastArgs: Args | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const invoke = () => {
    if (lastArgs) {
      func(...lastArgs);
      lastInvokeTime = Date.now();
      lastArgs = null;
    }
  };

  return function throttled(...args: Args) {
    const now = Date.now();
    lastArgs = args;

    if (!lastInvokeTime || now - lastInvokeTime >= wait) {
      // First call or enough time has passed
      invoke();
    } else {
      // Schedule invocation for the remaining time
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const remaining = wait - (now - lastInvokeTime);
      timeoutId = setTimeout(invoke, remaining);
    }
  };
}