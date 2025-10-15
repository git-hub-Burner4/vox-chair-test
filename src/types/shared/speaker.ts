export type Speaker = {
  id: string
  name: string
  flagQuery: string
  attendance?: 'present' | 'present-voting' | 'absent'
  yieldedTime?: number
  isYielded?: boolean
  code?: string
}