import { PlaylistSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

function capitalize(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const playlists = await db.playlistStore.getUserPlaylists(loggedInUser._id);

      const viewData = {
        title: "Workspace Dashboard",
        user: loggedInUser,
        playlists: playlists,
      };

      return h.view("dashboard-view", viewData);
    },
  },

  addPlaylist: {
    validate: {
      payload: PlaylistSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h
          .view("dashboard-view", {
            title: "Add Category Error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },

    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      const newPlayList = {
        userid: loggedInUser._id,
        title: capitalize(request.payload.title),
      };

      await db.playlistStore.addPlaylist(newPlayList);
      return h.redirect("/dashboard");
    },
  },

  deletePlaylist: {
  handler: async function (request, h) {

    const loggedInUser = request.auth.credentials;

    const playlist =
      await db.playlistStore.getPlaylistById(
        request.params.id
      );

    const isOwner =
      playlist.userid.toString() ===
      loggedInUser._id.toString();

    const isAdmin =
      loggedInUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return h.redirect("/dashboard");
    }

    await db.playlistStore.deletePlaylistById(
      playlist._id
    );

    return h.redirect("/dashboard");
  },
},
};