import React, { createContext, useState, useContext, ReactNode } from 'react';

// A estrutura dos dados que vêm do supabase
type UserType = {
  id: string;
  username: string;
  type: 'admin' | 'condomino';
};

// A estrutura do nosso Context
type AuthContextType = {
  user: UserType | null;
  login: (userData: UserType) => void;
  logout: () => void;
};

// Criar o Context com valores por defeito
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// O Provider que vai envolver a app inteira
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);

  const login = (userData: UserType) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Um Hook customizado para facilitar a vida nos ecrãs
export function useAuth() {
  return useContext(AuthContext);
}
