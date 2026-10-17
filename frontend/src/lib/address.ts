/** 0x1234…abcd */
export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
