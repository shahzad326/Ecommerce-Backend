import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET || "";

export interface PayloadType {
  userId: number;
  iat?: number;
  exp?: number;
}

const signToken = (payload: PayloadType, expiresIn: string = "1w") =>
  jwt.sign(payload, secret, { expiresIn });

const verifyJWTToken = (token: string) => jwt.verify(token, secret);

export { signToken, verifyJWTToken };
