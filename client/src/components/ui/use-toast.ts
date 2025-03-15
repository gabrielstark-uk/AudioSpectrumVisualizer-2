import * as React from "react"

// Simple toast hook that doesn't actually do anything
export function useToast() {
  return {
    toast: () => {},
    dismiss: () => {},
    toasts: []
  }
}

export const toast = () => {
  return {
    id: "1",
    dismiss: () => {},
    update: () => {}
  }
}