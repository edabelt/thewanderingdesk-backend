import { TrackSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";
import fetch from "node-fetch";

function capitalize(text) {
  if (!text) return "";

  const trimmed = text.trim();

  if (!trimmed) return "";

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export const categoryController = {

  index: {
    handler: async function (request, h) {

      const playlist = await db.playlistStore.getPlaylistById(
        request.params.id
      );

      const loggedInUser = request.auth.credentials;

      const apiKey = process.env.OPENWEATHER_API_KEY;

      for (const track of playlist.tracks) {

        try {

          if (track.latitude && track.longitude) {

            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${track.latitude}&lon=${track.longitude}&appid=${apiKey}&units=metric`
            );

            const data = await response.json();

            track.weather = {
              temp: data.main?.temp,
              description: data.weather?.[0]?.description,
              icon: data.weather?.[0]?.icon,
            };
          }

        } catch (error) {

          track.weather = null;
        }

        track.canManage = false;

        if (loggedInUser.role === "admin") {
          track.canManage = true;
        }

        if (
          track.userid &&
          track.userid.toString() === loggedInUser._id.toString()
        ) {
          track.canManage = true;
        }
      }

      const viewData = {
        title: "Category",
        playlist: playlist,
        user: loggedInUser,
        isAdmin: loggedInUser.role === "admin",
      };

      return h.view("category-view", viewData);
    },
  },

  addTrack: {
    validate: {
      payload: TrackSpec,

      options: { abortEarly: false },

      failAction: async function (request, h, error) {

        const currentPlaylist =
          await db.playlistStore.getPlaylistById(
            request.params.id
          );

        const loggedInUser = request.auth.credentials;

        const apiKey = process.env.OPENWEATHER_API_KEY;

        for (const track of currentPlaylist.tracks) {

          try {

            if (track.latitude && track.longitude) {

              const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${track.latitude}&lon=${track.longitude}&appid=${apiKey}&units=metric`
              );

              const data = await response.json();

              track.weather = {
                temp: data.main?.temp,
                description: data.weather?.[0]?.description,
                icon: data.weather?.[0]?.icon,
              };
            }

          } catch (error) {

            track.weather = null;
          }

          track.canManage = false;

          if (loggedInUser.role === "admin") {
            track.canManage = true;
          }

          if (
            track.userid &&
            track.userid.toString() === loggedInUser._id.toString()
          ) {
            track.canManage = true;
          }
        }

        return h
          .view("category-view", {
            title: "Add Workspace Error",
            playlist: currentPlaylist,
            user: loggedInUser,
            isAdmin: loggedInUser.role === "admin",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },

    handler: async function (request, h) {

      const playlist = await db.playlistStore.getPlaylistById(
        request.params.id
      );

      const loggedInUser = request.auth.credentials;

      const newTrack = {

        name: capitalize(request.payload.name),

        locationName: capitalize(
          request.payload.locationName
        ),

        latitude: Number(request.payload.latitude),

        longitude: Number(request.payload.longitude),

        description: capitalize(
          request.payload.description
        ),

        image:
          request.payload.image &&
          request.payload.image.trim() !== ""
            ? request.payload.image
            : "",

        userid: loggedInUser._id,
      };

      await db.trackStore.addTrack(
        playlist._id,
        newTrack
      );

      return h.redirect(`/category/${playlist._id}`);
    },
  },

  deleteTrack: {
    handler: async function (request, h) {

      const loggedInUser = request.auth.credentials;

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

        return h.redirect(
          `/category/${request.params.id}`
        );
      }

      await db.trackStore.deleteTrack(
        request.params.trackid
      );

      return h.redirect(
        `/category/${request.params.id}`
      );
    },
  },
};