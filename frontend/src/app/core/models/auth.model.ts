export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  document_number: string;
  type: 'admin' | 'employee' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  document_number: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}
