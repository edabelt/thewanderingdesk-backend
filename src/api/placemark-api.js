import Boom from "@hapi/boom";

import sanitizeHtml
  from "sanitize-html";

import { db } from "../models/db.js";

import {
  IdSpec,
  TrackSpec,
  TrackSpecPlus,
  TrackArraySpec
} from "../models/joi-schemas.js";

import { validationError }
  from "./logger.js";

function cleanText(value) {

  return sanitizeHtml(
    value || "",
    {
      allowedTags: [],
      allowedAttributes: {}
    }
  );

}

function sanitizePlacemark(payload) {

  return {
    ...payload,

    name:
      cleanText(payload.name),

    locationName:
      cleanText(payload.locationName),

    description:
      cleanText(payload.description),

    image:
      cleanText(payload.image)
  };

}

export const placemarkApi = {

  find: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const placemarks =
          await db.trackStore
            .getAllTracks();

        return placemarks;

      } catch (err) {

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    response: {
      schema: TrackArraySpec,
      failAction: validationError
    },

    description:
      "Get all placemarks",

    notes:
      "Returns all placemarks",

  },

  findOne: {

    auth: false,

    async handler(request) {

      try {

        const placemark =
          await db.trackStore
            .getTrackById(
              request.params.id
            );

        if (!placemark) {

          return Boom.notFound(
            "No placemark with this id"
          );

        }

        return placemark;

      } catch (err) {

        return Boom.serverUnavailable(
          "No placemark with this id"
        );

      }

    },

    tags: ["api"],

    description:
      "Find a Workspace",

    notes:
      "Returns a placemark",

    validate: {

      params: {
        id: IdSpec
      },

      failAction:
        validationError

    },

    response: {
      schema: TrackSpecPlus,
      failAction: validationError
    },

  },

  create: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const cleanPayload =
          sanitizePlacemark(
            request.payload
          );

        const placemark =
          await db.trackStore
            .addTrack(
              request.params.id,
              cleanPayload
            );

        if (placemark) {

          return h
            .response(placemark)
            .code(201);

        }

        return Boom.badImplementation(
          "error creating placemark"
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
      "Create a placemark",

    notes:
      "Returns the newly created placemark",

    validate: {
      payload: TrackSpec,
      failAction: validationError
    },

    response: {
      schema: TrackSpecPlus,
      failAction: validationError
    },

  },

  update: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const placemark =
          await db.trackStore
            .getTrackById(
              request.params.id
            );

        if (!placemark) {

          return Boom.notFound(
            "No Workspace with this id"
          );

        }

        const cleanPayload =
          sanitizePlacemark(
            request.payload
          );

        const updatedPlacemark =
          await db.trackStore
            .updateTrack(
              placemark,
              cleanPayload
            );

        return updatedPlacemark;

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Update a workspace",

    validate: {

      params: {
        id: IdSpec
      },

      payload: TrackSpec,

      failAction:
        validationError

    },

    response: {
      schema: TrackSpecPlus,
      failAction: validationError
    },

  },

  deleteAll: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        await db.trackStore
          .deleteAllTracks();

        return h.response().code(204);

      } catch (err) {

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    },

    tags: ["api"],

    description:
      "Delete all placemarks",

  },

  deleteOne: {

    auth: false,

    handler: async function (
      request,
      h
    ) {

      try {

        const placemark =
          await db.trackStore
            .getTrackById(
              request.params.id
            );

        if (!placemark) {

          return Boom.notFound(
            "No Workspace with this id"
          );

        }

        await db.trackStore
          .deleteTrack(
            placemark._id
          );

        return h.response().code(204);

      } catch (err) {

        return Boom.serverUnavailable(
          "No Workspace with this id"
        );

      }

    },

    tags: ["api"],

    description:
      "Delete a placemark",

    validate: {

      params: {
        id: IdSpec
      },

      failAction:
        validationError

    },

  },

};