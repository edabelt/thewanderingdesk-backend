import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

export const accountsController = {

  index: {
    auth: false,

    handler: function (request, h) {

      return h.view("main", {
        title: "Welcome to The Wandering Desk",
      });
    },
  },

  showSignup: {
    auth: false,

    handler: function (request, h) {

      return h.view("signup-view", {
        title: "Sign Up for The Wandering Desk",
      });
    },
  },

  signup: {
    auth: false,

    validate: {
      payload: UserSpec,

      options: { abortEarly: false },

      failAction: function (request, h, error) {

        return h
          .view("signup-view", {
            title: "Sign Up Error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },

    handler: async function (request, h) {

      // Create a normal user account by default
      const user = {
        ...request.payload,
        role: "user",
      };

      // Save user to database
      await db.userStore.addUser(user);

      return h.redirect("/");
    },
  },

  showLogin: {
    auth: false,

    handler: function (request, h) {

      return h.view("login-view", {
        title: "Log In to The Wandering Desk",
      });
    },
  },

  login: {
    auth: false,

    validate: {
      payload: UserCredentialsSpec,

      options: { abortEarly: false },

      failAction: function (request, h, error) {

        return h
          .view("login-view", {
            title: "Log In Error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },

    handler: async function (request, h) {

      const { email, password } = request.payload;

      const user =
        await db.userStore.getUserByEmail(email);

      // Invalid login credentials
      if (!user || user.password !== password) {

        return h
          .view("login-view", {
            title: "Log In Error",
            errors: [
              { message: "Invalid email or password" }
            ],
          })
          .takeover()
          .code(401);
      }

      // Create authenticated session
      request.cookieAuth.set({
        id: user._id,
      });

      return h.redirect("/dashboard");
    },
  },

  logout: {

    handler: function (request, h) {

      request.cookieAuth.clear();

      return h.redirect("/");
    },
  },

  isAdmin: function (user) {

    return user && user.role === "admin";
  },

  validate: async function (request, session) {

    const user =
      await db.userStore.getUserById(session.id);

    // Invalid session
    if (!user) {

      return { isValid: false };
    }

    // Valid authenticated session
    return {
      isValid: true,
      credentials: user,
    };
  },
};