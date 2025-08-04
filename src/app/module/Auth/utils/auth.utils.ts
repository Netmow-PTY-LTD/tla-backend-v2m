import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import User from '../models/auth.model';

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






export const setUserOnlineStatus = async (userId: string, isOnline: boolean) => {
  await User.findByIdAndUpdate(userId, {
    isOnline,
    lastSeen: isOnline ? null : new Date(),
  });
};
