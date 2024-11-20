export function convertToDisplayName(id: string | null) {
  if (!id) {
    return null
  }

  const lookupTable = {
    name: '贊助者名稱',
    amount: '贈訂數量',
  } as const

  return (lookupTable[id] as string) ?? null
}
