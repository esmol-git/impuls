import { ElMessageBox } from 'element-plus'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function useConfirm() {
  async function confirm(options: ConfirmOptions) {
    try {
      await ElMessageBox.confirm(options.message, options.title, {
        confirmButtonText: options.confirmLabel || 'Подтвердить',
        cancelButtonText: options.cancelLabel || 'Отмена',
        type: options.danger ? 'warning' : 'info',
        confirmButtonClass: options.danger ? 'el-button--danger' : undefined,
      })
      return true
    } catch {
      return false
    }
  }

  return { confirm }
}
