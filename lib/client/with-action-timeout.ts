import type { ActionResult } from "@/lib/server/action-result";

const NETWORK_TIMEOUT =
  "The request took too long. Check your connection and try again.";

/**
 * Race a server action against a client-side timeout so the UI never hangs.
 */
export async function withActionTimeout<T>(
  action: Promise<ActionResult<T>>,
  ms: number,
): Promise<ActionResult<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<ActionResult<T>>((resolve) => {
    timeoutId = setTimeout(
      () => resolve({ success: false, error: NETWORK_TIMEOUT }),
      ms,
    );
  });

  try {
    return await Promise.race([action, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
