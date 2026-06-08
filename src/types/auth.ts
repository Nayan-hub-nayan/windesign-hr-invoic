export interface AuthUser {
  sub: string
  email: string
  name: string
  picture: string
  emailVerified: boolean
}

export interface AuthSession {
  user: AuthUser
  credential: string
  signedInAt: number
}
