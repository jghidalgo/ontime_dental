import { connectToDatabase } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';
import User from '@/models/User';

export const resolvers = {
  Query: {
    health: () => 'ok'
  },
  Mutation: {
    async login(_: unknown, args: { email: string; password: string }) {
      const { email, password } = args;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await connectToDatabase();

      const user = await User.findOne({ email }).lean();

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(password, user.password);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = createToken({ sub: user._id.toString(), role: user.role, email: user.email });

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }
  }
};
