import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("david@example.com").required(),
    password: Joi.string().example("secret123").required(),
  })
  .label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
  firstName: Joi.string().example("David").required(),
  lastName: Joi.string().example("Beltran").required(),
  role: Joi.string().default("user").optional(),
}).label("UserDetails");

export const UserSpecPlus = UserSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

export const TrackSpec = Joi.object()
  .keys({
    name: Joi.string().required().example("Cliffs of Moher"),

    locationName: Joi.string()
      .required()
      .example("County Clare"),

    latitude: Joi.number()
      .required()
      .messages({
        "number.base": "Latitude must be a number",
        "any.required": "Latitude is required",
      })
      .example(52.9715),

    longitude: Joi.number()
      .required()
      .messages({
        "number.base": "Longitude must be a number",
        "any.required": "Longitude is required",
      })
      .example(-9.4309),

    description: Joi.string()
      .max(500)
      .allow("")
      .optional()
      .messages({
        "string.max": "Description must be 500 characters or fewer",
      })
      .example("Famous coastal cliffs in Ireland."),

    image: Joi.string()
  .allow("")
  .optional()
  .example("https://example.com/cliffs.jpg"),

    playlistid: IdSpec,
  })
  .label("Workspace");

export const TrackSpecPlus = TrackSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("WorkspacePlus");

export const TrackArraySpec = Joi.array().items(TrackSpecPlus).label("WorkspaceArray");

export const PlaylistSpec = Joi.object()
  .keys({
    title: Joi.string()
      .required()
      .example("Irish Landmarks"),

    userid: IdSpec,

    tracks: TrackArraySpec.optional(),
  })
  .label("Category");

export const PlaylistSpecPlus = PlaylistSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("CategoryPlus");

export const PlaylistArraySpec = Joi.array().items(PlaylistSpecPlus).label("CategoryArray");

export const JwtAuth = Joi.object()
  .keys({

    success:
      Joi.boolean()
        .example(true)
        .required(),

    token:
      Joi.string()
        .example(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature"
        )
        .required(),

    user:
      UserSpecPlus.required()

  })
  .label("JwtAuth");