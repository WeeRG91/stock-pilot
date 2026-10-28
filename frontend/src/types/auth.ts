export type AuthUser = {
  id: number;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  data: {
    user: AuthUser;
  };
};
