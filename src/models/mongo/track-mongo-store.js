import { Track } from "./track.js";

export const trackMongoStore = {

  async getAllTracks() {

    const tracks =
      await Track.find().lean();

    return tracks;

  },

  async getPublicTracks() {

    const tracks =
      await Track.find({
        isPublic: true
      }).lean();

    return tracks;

  },

  async addTrack(playlistId, track) {

    const image =
      track.image || "";

    const images =
      track.images && Array.isArray(track.images)
        ? track.images
        : image
          ? [image]
          : [];

    const newTrack = {

      name:
        track.name,

      locationName:
        track.locationName,

      latitude:
        Number(track.latitude),

      longitude:
        Number(track.longitude),

      description:
        track.description,

      image:
        image,

      images:
        images,

      isPublic:
        track.isPublic || false,

      ratings:
        [],

      userid:
        track.userid,

      playlistid:
        playlistId

    };

    const trackDoc =
      new Track(newTrack);

    const savedTrack =
      await trackDoc.save();

    return this.getTrackById(
      savedTrack._id
    );

  },

  async getTracksByPlaylistId(id) {

    const tracks =
      await Track.find({
        playlistid: id
      }).lean();

    const tracksWithWeather =
      await Promise.all(

        tracks.map(async (track) => {

          try {

            const apiKey =
              process.env.OPENWEATHER_API_KEY;

            const response =
              await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${track.latitude}&lon=${track.longitude}&units=metric&appid=${apiKey}`
              );

            const data =
              await response.json();

            if (
              data.weather &&
              data.main
            ) {

              track.weather = {

                description:
                  data.weather[0].description,

                icon:
                  data.weather[0].icon,

                temp:
                  data.main.temp

              };

            }

            return track;

          } catch (error) {

            console.log(error);

            return track;

          }

        })

      );

    return tracksWithWeather;

  },

  async getTrackById(id) {

    if (id) {

      const track =
        await Track.findOne({
          _id: id
        }).lean();

      return track;

    }

    return null;

  },

  async deleteTrack(id) {

    try {

      await Track.deleteOne({
        _id: id
      });

    } catch (error) {

      console.log("bad id");

    }

  },

  async deleteAllTracks() {

    await Track.deleteMany({});

  },

  async updateTrack(track, updatedTrack) {

    if (!track || !track._id) {

      throw new Error(
        "Invalid track supplied for update"
      );

    }

    const trackDoc =
      await Track.findOne({
        _id: track._id
      });

    if (!trackDoc) {

      throw new Error(
        "Track not found"
      );

    }

    const image =
      updatedTrack.image || "";

    const images =
      updatedTrack.images && Array.isArray(updatedTrack.images)
        ? updatedTrack.images
        : image
          ? [image]
          : [];

    trackDoc.name =
      updatedTrack.name;

    trackDoc.locationName =
      updatedTrack.locationName;

    trackDoc.latitude =
      Number(updatedTrack.latitude);

    trackDoc.longitude =
      Number(updatedTrack.longitude);

    trackDoc.description =
      updatedTrack.description;

    trackDoc.image =
      image;

    trackDoc.images =
      images;

    trackDoc.isPublic =
      updatedTrack.isPublic || false;

    await trackDoc.save();

    return this.getTrackById(
      trackDoc._id
    );

  },

  async rateTrack(
    trackId,
    userId,
    score
  ) {

    const track =
      await Track.findOne({
        _id: trackId
      });

    if (!track) {

      throw new Error(
        "Track not found"
      );

    }

    if (!track.ratings) {

      track.ratings =
        [];

    }

    const existingRating =
      track.ratings.find(
        (rating) =>
          rating.userid.toString() ===
          userId.toString()
      );

    if (existingRating) {

      existingRating.score =
        Number(score);

    } else {

      track.ratings.push({
        userid:
          userId,

        score:
          Number(score)
      });

    }

    await track.save();

    return this.getTrackById(
      trackId
    );

  }

};