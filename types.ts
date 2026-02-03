
export interface LoginResponse {
  success: boolean;
  message: string;
}

export enum AuthMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}
