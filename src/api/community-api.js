import Boom from "@hapi/boom";

import { db }
  from "../models/db.js";

export const communityApi = {

  findPublic: {

    auth: false,

    handler: async function () {

      try {

        const workspaces =
          await db.trackStore
            .getPublicTracks();

        const publicWorkspaces =
          workspaces.map((workspace) => {

            const ratings =
              workspace.ratings || [];

            const averageRating =
              ratings.length > 0
                ? (
                    ratings.reduce(
                      (total, rating) =>
                        total + rating.score,
                      0
                    ) / ratings.length
                  ).toFixed(1)
                : null;

            return {

              ...workspace,

              averageRating,

              totalRatings:
                ratings.length

            };

          });

        return publicWorkspaces;

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Database Error"
        );

      }

    }

  },

  rate: {

    auth: {
      strategy: "jwt"
    },

    handler: async function (
      request,
      h
    ) {

      try {

        const userId =
          request.auth.credentials._id;

        const updatedWorkspace =
          await db.trackStore
            .rateTrack(
              request.params.id,
              userId,
              request.payload.score
            );

        return updatedWorkspace;

      } catch (err) {

        console.log(err);

        return Boom.serverUnavailable(
          "Unable to save rating"
        );

      }

    }

  }

};