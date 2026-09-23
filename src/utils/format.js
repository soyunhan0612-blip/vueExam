/*
 * [개념]
 * 화면 표시용 포맷은 Vue 인스턴스에 의존하지 않는 일반 함수로 분리하면
 * 템플릿과 스크립트 어디서든 재사용할 수 있고 입력과 출력도 명확해진다.
 *
 * [Vue 2였다면]
 * filters: { currency(value) { return `${value.toLocaleString()}원` } }
 * {{ price | currency }}
 * Vue 3에서는 filters가 삭제되어 일반 함수나 computed를 사용한다.
 */

const numberFormatter = new Intl.NumberFormat('ko-KR')
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
})

export function formatWage(wage) {
  if (!wage || !wage.type || !Number.isFinite(Number(wage.amount))) return ''

  return `${wage.type} ${numberFormatter.format(Number(wage.amount))}원`
}

export function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return dateFormatter.format(date)
}

export function formatPhone(value) {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`

  const middleEnd = digits.length - 4
  return `${digits.slice(0, 3)}-${digits.slice(3, middleEnd)}-${digits.slice(middleEnd)}`
}
