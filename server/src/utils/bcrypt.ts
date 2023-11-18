import { compare, hash } from "bcryptjs";

const BCRYPT_HASH = 10 as const;

async function hashPassword(password: string) {
  try {
    return await hash(password, BCRYPT_HASH);
  } catch (error) {
    return null;
  }
}
async function comparePassword(plainPwd: string, hashedPwd: string) {
  try {
    return await compare(plainPwd, hashedPwd);
  } catch (error) {
    return false;
  }
}

const bcrypt = {
  hashPassword,
  comparePassword,
};

export default bcrypt;
