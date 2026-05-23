import Boom from "@hapi/boom";

import { db }
  from "../models/db.js";

export const adminApi = {

  analytics: {

    auth: {
      strategy: "jwt"
    },

    handler: async function (request) {

      try {

        const user =
          request.auth.credentials;

        if (user.role !== "admin") {

          return Boom.unauthorized(
            "Admins only"
          );

        }

        const users =
          await db.userStore.getAllUsers();

        const categories =
          await db.playlistStore.getAllPlaylists();

        const placemarks =
          await db.trackStore.getAllTracks();

        const categoryAnalytics =
          categories.map((category) => {

            const count =
              placemarks.filter(
                (placemark) =>
                  placemark.playlistid?.toString() ===
                  category._id.toString()
              ).length;

            return {

              category:
                category.title,

              count

            };

          });

        const projectionData = [

          placemarks.length,

          placemarks.length + 2,

          placemarks.length + 4,

          placemarks.length + 6

        ];

        return {

          totals: {

            users:
              users.length,

            categories:
              categories.length,

            placemarks:
              placemarks.length

          },

          categoryAnalytics,

          projections:
            projectionData

        };

      } catch (err) {

        throw Boom.serverUnavailable(
          "Analytics unavailable"
        );

      }

    }

  }

};