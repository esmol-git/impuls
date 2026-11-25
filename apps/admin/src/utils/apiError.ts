/** Сообщение из Error / неизвестного throw для toast. */
export function getErrorMessage(error: unknown, fallback = 'Ошибка запроса') {
  return error instanceof Error && error.message ? error.message : fallback
}
