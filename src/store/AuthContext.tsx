import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData } from '../types/user';
import storage from '../utils/storage';
import { hashPassword, verifyPassword, generateUserId } from '../utils/auth';

const USERS_KEY = 'smart_alarm_users';
const CURRENT_USER_KEY = 'smart_alarm_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.get<User>(CURRENT_USER_KEY);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const getUsers = useCallback((): User[] => {
    return storage.get<User[]>(USERS_KEY, []) || [];
  }, []);

  const saveUsers = useCallback((users: User[]) => {
    storage.set(USERS_KEY, users);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const users = getUsers();
      const foundUser = users.find(
        (u) =>
          u.username === credentials.usernameOrEmail ||
          u.email === credentials.usernameOrEmail
      );

      if (!foundUser) {
        throw new Error('用户不存在');
      }

      const isPasswordValid = await verifyPassword(
        credentials.password,
        foundUser.password
      );

      if (!isPasswordValid) {
        throw new Error('密码错误');
      }

      setUser(foundUser);
      storage.set(CURRENT_USER_KEY, foundUser);
    } finally {
      setIsLoading(false);
    }
  }, [getUsers]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const users = getUsers();

      const usernameExists = users.some((u) => u.username === data.username);
      if (usernameExists) {
        throw new Error('用户名已被注册');
      }

      const emailExists = users.some((u) => u.email === data.email);
      if (emailExists) {
        throw new Error('邮箱已被注册');
      }

      const hashedPassword = await hashPassword(data.password);

      const newUser: User = {
        id: generateUserId(),
        username: data.username,
        email: data.email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      setUser(newUser);
      storage.set(CURRENT_USER_KEY, newUser);
    } finally {
      setIsLoading(false);
    }
  }, [getUsers, saveUsers]);

  const logout = useCallback(() => {
    setUser(null);
    storage.remove(CURRENT_USER_KEY);
  }, []);

  const guestLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const guestUser: User = {
        id: 'guest_' + Date.now(),
        username: '访客用户',
        email: 'guest@smart-alarm.app',
        password: '',
        createdAt: new Date().toISOString(),
        isGuest: true,
      };

      setUser(guestUser);
      storage.set(CURRENT_USER_KEY, guestUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
