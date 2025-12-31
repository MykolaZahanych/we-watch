export interface RegisterData {
  email: string;
  password: string;
  repeatPassword: string;
  nickname: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

