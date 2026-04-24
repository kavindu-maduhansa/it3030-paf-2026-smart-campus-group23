import hotToast from 'react-hot-toast'

type ToastMessage = string

const baseOptions = {
  duration: 3500,
}

export const toast = {
  success: (message: ToastMessage) =>
    hotToast.success(message, {
      ...baseOptions,
      icon: '✓',
    }),
  error: (message: ToastMessage) =>
    hotToast.error(message, {
      ...baseOptions,
      icon: '!',
    }),
  info: (message: ToastMessage) =>
    hotToast(message, {
      ...baseOptions,
      icon: 'i',
    }),
  warning: (message: ToastMessage) =>
    hotToast(message, {
      ...baseOptions,
      icon: '⚠',
    }),
}

