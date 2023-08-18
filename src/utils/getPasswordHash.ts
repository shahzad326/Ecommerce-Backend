import bcrypt from "bcrypt";

const generateHash = async (password: string) => {
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );
  return hashedPassword;
};

const comparePassword = async (password: string, comparedVal: string) => {
  return await bcrypt.compare(password, comparedVal);
};

export { comparePassword, generateHash };
