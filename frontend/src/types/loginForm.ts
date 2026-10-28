export type LoginFormState = {
  email: string;
  fieldErrors: {
    email?: string;
    password?: string;
  };
  message?: string;
};
