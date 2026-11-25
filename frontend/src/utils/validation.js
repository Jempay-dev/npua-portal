export const PASSWORD_HINT = "Օգտագործեք առնվազն 8 նիշ։";

export function validateNewPassword(password, confirm) {
  if (password.length < 8) return PASSWORD_HINT;
  if (password !== confirm) return "Գաղտնաբառերը չեն համընկնում։";
  return "";
}
