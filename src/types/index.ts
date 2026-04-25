export type QRType = 'wifi' | 'url' | 'text'

export interface WifiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface UrlData {
  url: string
}

export interface TextData {
  text: string
}

export type QRData = WifiData | UrlData | TextData