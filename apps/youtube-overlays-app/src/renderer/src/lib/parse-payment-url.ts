import { ParsedPaymentUrlData } from '../../../main/schema'

export type PaymentType = 'ECPAY' | 'ECPAY_STAGE' | 'OPAY' | 'UNKNOWN'

function getIdFromPathname(pathname: string) {
  return pathname.replaceAll('/Broadcaster/AlertBox/', '').replaceAll('/Broadcaster/Donate/', '')
}

export function parsePaymentUrl(originalUrl: string): ParsedPaymentUrlData {
  const parsedUrl = (function parseUrl() {
    try {
      return new URL(originalUrl)
    } catch {
      return null
    }
  })()

  if (!parsedUrl) {
    return { type: 'UNKNOWN', id: '' }
  }

  switch (parsedUrl.host) {
    case 'payment.ecpay.com.tw':
      return { type: 'ECPAY', id: getIdFromPathname(parsedUrl.pathname) }

    case 'payment-stage.ecpay.com.tw':
      return { type: 'ECPAY_STAGE', id: getIdFromPathname(parsedUrl.pathname) }

    case 'payment.opay.tw':
      return { type: 'OPAY', id: getIdFromPathname(parsedUrl.pathname) }

    default:
      return { type: 'UNKNOWN', id: '' }
  }
}
