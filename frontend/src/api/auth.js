// Auth API layer.
// For now these functions check the made-up users in the local store.
// When the backend is ready, replace each body with a real fetch() call —
// the pages won't need to change.

import { getData, updateItem } from "../data/store.js";

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const findUser = (email) =>
  getData().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

export async function signIn({ email, password }) {
  await wait();
  const user = findUser(email);
  if (!user || !user.active || user.password !== password) {
    throw new Error("Սխալ էլ. հասցե կամ գաղտնաբառ։");
  }
  return user;
}

export async function verifyActivationCode({ email, code }) {
  await wait();
  if (code.length !== 6) throw new Error("Մուտքագրեք 6 նիշանոց կոդը։");
  const user = findUser(email);
  if (!user || user.active || user.activationCode !== code) {
    throw new Error("Էլ. հասցեն կամ կոդը սխալ է։");
  }
  return { email: user.email };
}

export async function activateAccount({ email, password }) {
  await wait();
  const user = findUser(email);
  if (!user) throw new Error("Հաշիվը չի գտնվել։");
  updateItem("users", user.id, { password, active: true, activationCode: null });
  return { email };
}

export async function requestPasswordReset() {
  await wait();
  return { ok: true };
}

export async function resetPassword() {
  await wait();
  return { ok: true };
}
