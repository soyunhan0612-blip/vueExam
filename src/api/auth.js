// 목업 인증이므로 클라이언트에서 비교하지만, 실제 서비스에서는 서버가 자격 증명을 검증한다.
import http from './http.js'

export async function login(email, password) {
  const response = await http.get('/users', {
    params: { email },
  })
  const user = response.data.find((candidate) => candidate.password === password)

  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token: `mock-token-${user.id}`,
  }
}
