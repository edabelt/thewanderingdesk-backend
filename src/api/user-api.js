import Boom from "@hapi/boom";

import bcrypt from "bcrypt";

import { db }
  from "../models/db.js";

import {

  UserCredentialsSpec,
  UserSpec,
  UserSpecPlus,
  IdSpec,
  UserArray,
  JwtAuth

} from "../models/joi-schemas.js";

import { validationError }
  from "./logger.js";

import { createToken }
  from "./jwt-utils.js";

export const userApi = {

  find: {

    auth: {
      strategy: "jwt"
    },

    handler: async function (
      request,
      h
    ) {

      try {

        const users =
          await db.userStore
            .getAllUsers();

        return users;

      } catch (err) {

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Get all users",

    notes:
      "Returns details of all users",

    response: {

      schema:
        UserArray,

      failAction:
        validationError

    }

  },

  findOne: {

    auth: {
      strategy: "jwt"
    },

    handler: async function (
      request,
      h
    ) {

      try {

        const user =
          await db.userStore
            .getUserById(
              request.params.id
            );

        if (!user) {

          return Boom.notFound(
            "No User with this id"
          );

        }

        return user;

      } catch (err) {

        return Boom.serverUnavailable(
          "No User with this id"
        );

      }

    },

    tags: ["api"],

    description:
      "Get a specific user",

    notes:
      "Returns user details",

    validate: {

      params: {

        id:
          IdSpec

      },

      failAction:
        validationError

    },

    response: {

      schema:
        UserSpecPlus,

      failAction:
        validationError

    }

  },

  create: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const userPayload = {

          ...request.payload,

          password:
            await bcrypt.hash(
              request.payload.password,
              10
            ),

          role:
            request.payload.role || "user"

        };

        const user =
          await db.userStore
            .addUser(
              userPayload
            );

        if (user) {

          return h
            .response(user)
            .code(201);

        }

        return Boom.badImplementation(
          "error creating user"
        );

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Create a User",

    notes:
      "Returns the newly created user",

    validate: {

      payload:
        UserSpec,

      failAction:
        validationError

    },

    response: {

      schema:
        UserSpecPlus,

      failAction:
        validationError

    }

  },

  deleteAll: {

    auth: {
      strategy: "jwt"
    },

    handler: async function (
      request,
      h
    ) {

      try {

        await db.userStore
          .deleteAll();

        return h
          .response()
          .code(204);

      } catch (err) {

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Delete all users",

    notes:
      "All users removed"

  },

  authenticate: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const user =
          await db.userStore
            .getUserByEmail(
              request.payload.email
            );

        if (!user) {

          return Boom.unauthorized(
            "User not found"
          );

        }

        const isValidPassword =
          await bcrypt.compare(
            request.payload.password,
            user.password
          );

        if (!isValidPassword) {

          return Boom.unauthorized(
            "Invalid password"
          );

        }

        const token =
          createToken(user);

        console.log(
          "LOGIN USER ROLE:",
          user.role
        );

        return h.response({

          success:
            true,

          token:
            token,

          user: {

            _id:
              user._id,

            firstName:
              user.firstName,

            lastName:
              user.lastName,

            email:
              user.email,

            password:
              user.password,

            role:
              user.role || "user"

          }

        }).code(201);

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Authenticate a User",

    notes:
      "If user has valid email/password, create and return a JWT token",

    validate: {

      payload:
        UserCredentialsSpec,

      failAction:
        validationError

    },

    response: {

      schema:
        JwtAuth,

      failAction:
        validationError

    }

  },

  firebaseAuth: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        let user =
          await db.userStore
            .getUserByEmail(
              request.payload.email
            );

        if (!user) {

          const userPayload = {

            firstName:
              request.payload.firstName || "Google",

            lastName:
              request.payload.lastName || "User",

            email:
              request.payload.email,

            password:
              await bcrypt.hash(
                `firebase-${request.payload.email}`,
                10
              ),

            role:
              "user"

          };

          user =
            await db.userStore
              .addUser(
                userPayload
              );

        }

        const token =
          createToken(user);

        return h.response({

          success:
            true,

          token:
            token,

          user: {

            _id:
              user._id,

            firstName:
              user.firstName,

            lastName:
              user.lastName,

            email:
              user.email,

            password:
              user.password,

            role:
              user.role || "user"

          }

        }).code(201);

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Firebase authentication failed"
        );

      }

    }

  }

};