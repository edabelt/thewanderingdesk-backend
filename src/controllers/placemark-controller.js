import { TrackSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const placemarkController = {

  index: {
    handler: async function (request, h) {

      const loggedInUser =
        request.auth.credentials;

      const playlist =
        await db.playlistStore.getPlaylistById(
          request.params.id
        );

      const track =
        await db.trackStore.getTrackById(
          request.params.trackid
        );

      const isOwner =
        track.userid &&
        track.userid.toString() ===
          loggedInUser._id.toString();

      const isAdmin =
        loggedInUser.role === "admin";

      if (!isOwner && !isAdmin) {
        return h.redirect("/dashboard");
      }

      const viewData = {
        title: "Edit Workspace",
        playlist: playlist,
        track: track,
      };

      return h.view("placemark-view", viewData);
    },
  },

  update: {
    validate: {
      payload: TrackSpec,

      options: { abortEarly: false },

      failAction: async function (request, h, error) {

        const playlist =
          await db.playlistStore.getPlaylistById(
            request.params.id
          );

        const track =
          await db.trackStore.getTrackById(
            request.params.trackid
          );

        return h
          .view("placemark-view", {
            title: "Edit Workspace Error",
            playlist: playlist,
            track: track,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },

    handler: async function (request, h) {

      const loggedInUser =
        request.auth.credentials;

      const track =
        await db.trackStore.getTrackById(
          request.params.trackid
        );

      const isOwner =
        track.userid &&
        track.userid.toString() ===
          loggedInUser._id.toString();

      const isAdmin =
        loggedInUser.role === "admin";

      if (!isOwner && !isAdmin) {
        return h.redirect("/dashboard");
      }

      const newTrack = {

        name: capitalize(request.payload.name),

        locationName: capitalize(
          request.payload.locationName
        ),

        latitude: Number(
          request.payload.latitude
        ),

        longitude: Number(
          request.payload.longitude
        ),

        description: capitalize(
          request.payload.description
        ),

        image: request.payload.image,
      };

      await db.trackStore.updateTrack(
        track,
        newTrack
      );

      return h.redirect(
        `/category/${request.params.id}`
      );
    },
  },
};