import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';

export const createToken = (
  jwtPayload: { email: string; role: string },
  secret: string,
  expiresIn: StringValue | number,
) => {
  const options: SignOptions = {
    expiresIn: expiresIn,
  };
  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
