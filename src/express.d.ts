// src/express.d.ts
import { User } from './auth/schemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      user: User;  // Add this to extend the Request interface with a `user` field
    }
  }
}
