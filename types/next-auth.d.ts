declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role?: string
      userType?: 'admin' | 'user'
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string
    role?: string
    userType?: 'admin' | 'user'
  }
}

