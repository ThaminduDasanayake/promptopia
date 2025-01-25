import User from "@models/user";
import { connectToDB } from "@utils/database";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async session({ session }) {
      try {
        await connectToDB(); // Ensure DB connection is established
        const sessionUser = await User.findOne({ email: session.user.email });

        if (!sessionUser) {
          throw new Error("User not found");
        }

        session.user.id = sessionUser._id.toString();
        return session;
      } catch (error) {
        console.error("Session error:", error);
        throw new Error("Failed to fetch user session");
      }
      // const sessionUser = await User.findOne({ email: session.user.email });
      // session.user.id = sessionUser._id.toString();

      // return session;
    },

    async signIn({ profile }) {
      try {
        await connectToDB();

        // check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // if not, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
