// Simplified version for brevity
import { useState } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  return {
    toasts,
    toast: (props) => {
      setToasts((prevToasts) => [...prevToasts, { id: Date.now(), ...props }])
    },
    dismiss: (id) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    },
  }
}

