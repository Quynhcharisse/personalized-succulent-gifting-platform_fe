import { useCallback } from 'react'
import { useSnackbar } from 'notistack'

export default function useNotify() {
  const { enqueueSnackbar } = useSnackbar()

  const notify = useCallback(
    (message, options = {}) => enqueueSnackbar(message, options),
    [enqueueSnackbar]
  )

  const success = useCallback((message, options = {}) => notify(message, { variant: 'success', ...options }), [notify])
  const error = useCallback((message, options = {}) => notify(message, { variant: 'error', ...options }), [notify])
  const info = useCallback((message, options = {}) => notify(message, { variant: 'info', ...options }), [notify])
  const warning = useCallback((message, options = {}) => notify(message, { variant: 'warning', ...options }), [notify])

  return { notify, success, error, info, warning }
}


