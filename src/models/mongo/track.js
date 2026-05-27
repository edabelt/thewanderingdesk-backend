import Mongoose from "mongoose";

const { Schema } = Mongoose;

const ratingSchema =
  new Schema({

    userid: {

      type:
        Schema.Types.ObjectId,

      ref:
        "User"

    },

    score: {

      type:
        Number,

      min:
        1,

      max:
        5

    }

  });

const trackSchema =
  new Schema({

    name:
      String,

    locationName:
      String,

    latitude:
      Number,

    longitude:
      Number,

    description:
      String,

    image:
      String,

    images:
      [String],

    isPublic: {

      type:
        Boolean,

      default:
        false

    },

    ratings:
      [ratingSchema],

    userid: {

      type:
        Schema.Types.ObjectId,

      ref:
        "User"

    },

    playlistid: {

      type:
        Schema.Types.ObjectId,

      ref:
        "Playlist"

    }

  });

export const Track =
  Mongoose.model(
    "Track",
    trackSchema
  );