import { ElMessage } from 'element-plus'

export function useToast() {
  return {
    success: (message: string) => ElMessage.success(message),
    error: (message: string) => ElMessage.error(message),
    info: (message: string) => ElMessage.info(message),
  }
}
