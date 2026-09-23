export const CATEGORIES = [
  { value: 'food', label: '외식·음료' },
  { value: 'retail', label: '매장관리·판매' },
  { value: 'service', label: '서비스' },
  { value: 'production', label: '생산·건설' },
  { value: 'delivery', label: '운전·배달' },
  { value: 'office', label: '사무·회계' },
]

export const REGIONS = [
  { value: '강남구', label: '강남구' },
  { value: '마포구', label: '마포구' },
  { value: '송파구', label: '송파구' },
  { value: '영등포구', label: '영등포구' },
  { value: '관악구', label: '관악구' },
  { value: '종로구', label: '종로구' },
  { value: '성동구', label: '성동구' },
  { value: '노원구', label: '노원구' },
]

export function getCategoryLabel(value) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value ?? ''
}

export const STORAGE_KEYS = {
  AUTH: 'findjob:auth',
  SCRAPS: 'findjob:scraps',
}
