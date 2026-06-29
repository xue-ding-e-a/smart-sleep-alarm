export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  isGuest?: boolean;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  guestLogin: () => Promise<void>;
}
