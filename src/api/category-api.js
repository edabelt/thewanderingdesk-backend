import Boom from "@hapi/boom";

import {
  IdSpec,
  PlaylistSpec,
  PlaylistSpecPlus
} from "../models/joi-schemas.js";

import { db } from "../models/db.js";

import { validationError } from "./logger.js";

export const categoryApi = {

  find: {
    auth: {
      strategy: "jwt"
    },

    handler: async function (request, h) {

      try {

        const userId =
          request.auth.credentials._id;

        const categories =
          await db.playlistStore.getUserPlaylists(userId);

        const categoriesWithTracks =
          await Promise.all(
            categories.map(async (category) => {

              const tracks =
                await db.trackStore.getTracksByPlaylistId(category._id);

              return {
                ...category,
                tracks: tracks
              };

            })
          );

        return categoriesWithTracks;

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Get user categories",

    notes:
      "Returns categories with tracks for logged-in user"

  },

  findOne: {
    auth: {
      strategy: "jwt"
    },

    async handler(request) {

      try {

        const userId =
          request.auth.credentials._id;

        const category =
          await db.playlistStore.getPlaylistById(request.params.id);

        if (!category) {

          return Boom.notFound(
            "No Category with this id"
          );

        }

        if (category.userid.toString() !== userId.toString()) {

          return Boom.unauthorized(
            "Not your category"
          );

        }

        const tracks =
          await db.trackStore.getTracksByPlaylistId(category._id);

        return {
          ...category,
          tracks: tracks
        };

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "No Category with this id"
        );

      }

    },

    tags: ["api"],

    description:
      "Find a Category",

    notes:
      "Returns one user category with tracks",

    validate: {
      params: {
        id: IdSpec
      },
      failAction: validationError
    }

  },

  create: {
    auth: {
      strategy: "jwt"
    },

    handler: async function (request, h) {

      try {

        const userId =
          request.auth.credentials._id;

        const category = {
          title:
            request.payload.title,

          userid:
            userId
        };

        const newCategory =
          await db.playlistStore.addPlaylist(category);

        if (newCategory) {

          return h
            .response(newCategory)
            .code(201);

        }

        return Boom.badImplementation(
          "error creating category"
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
      "Create a Category",

    notes:
      "Creates a category for logged-in user",

    validate: {
      payload:
        PlaylistSpec,

      failAction:
        validationError
    },

    response: {
      schema:
        PlaylistSpecPlus,

      failAction:
        validationError
    }

  },

  deleteOne: {
    auth: {
      strategy: "jwt"
    },

    handler: async function (request, h) {

      try {

        const userId =
          request.auth.credentials._id;

        const category =
          await db.playlistStore.getPlaylistById(request.params.id);

        if (!category) {

          return Boom.notFound(
            "No Category with this id"
          );

        }

        if (category.userid.toString() !== userId.toString()) {

          return Boom.unauthorized(
            "Not your category"
          );

        }

        await db.playlistStore.deletePlaylistById(category._id);

        return h
          .response()
          .code(204);

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "No Category with this id"
        );

      }

    },

    tags: ["api"],

    description:
      "Delete a category",

    validate: {
      params: {
        id: IdSpec
      },
      failAction: validationError
    }

  },

  deleteAll: {
    auth: {
      strategy: "jwt"
    },

    handler: async function (request, h) {

      try {

        const userId =
          request.auth.credentials._id;

        const categories =
          await db.playlistStore.getUserPlaylists(userId);

        for (const category of categories) {

          await db.playlistStore.deletePlaylistById(category._id);

        }

        return h
          .response()
          .code(204);

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Delete logged-in user categories"

  }

};