import { toast } from "@/components/ui/toast"

export type ToastMessageOptions =
  | string
  | {
      message?: string
      title?: string
      description?: string
      duration?: number
    }

function parseMessage(opts: ToastMessageOptions): { title: string; description: string } {
  if (typeof opts === "string") {
    return { title: "", description: opts }
  }
  return {
    title: opts.title || "",
    description: opts.description || opts.message || "",
  }
}

export function showSuccess(opts: ToastMessageOptions) {
  const { title, description } = parseMessage(opts)
  toast.add({
    type: "success",
    title: title || "Success",
    description,
  })
}

export function showError(opts: ToastMessageOptions) {
  const { title, description } = parseMessage(opts)
  toast.add({
    type: "error",
    title: title || "Error",
    description: description || "An unexpected error occurred. Please try again.",
  })
}

export function showLoading(message: string) {
  toast.add({
    type: "info",
    title: "Processing",
    description: message,
  })
}

export function dismissToast() {
  // Base UI toast handles auto-dismissal
}

export { toast }
