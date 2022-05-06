export function isAndroid(): boolean {
  return /(android)/i.test(navigator.userAgent);
}
