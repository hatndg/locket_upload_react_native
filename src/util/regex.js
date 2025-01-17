export const checkEmail = email => {
  const emailRegex =
    "^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+.[a-zA-Z]+";
  return emailRegex.test(email);
};
