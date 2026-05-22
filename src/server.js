import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import jwt from "hapi-auth-jwt2";
import HapiSwagger from "hapi-swagger";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

import { webRoutes } from "./web-routes.js";
import { apiRoutes } from "./api-routes.js";

import { db } from "./models/db.js";

import { accountsController }
  from "./controllers/accounts-controller.js";

import { validate }
  from "./api/jwt-utils.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const result =
  dotenv.config();

if (result.error) {

  console.log(result.error.message);

}

const swaggerOptions = {

  info: {

    title: "Workspace API",

    version: "1.0",

  },

  securityDefinitions: {

    jwt: {

      type: "apiKey",

      name: "Authorization",

      in: "header",

    },

  },

  security: [
    {
      jwt: []
    }
  ],

};

Handlebars.registerHelper(
  "json",
  function (context) {

    return JSON.stringify(context);

  }
);

async function init() {

  const server =
    Hapi.server({

      port:
        process.env.PORT || 3000,

      host:
        "0.0.0.0",

      routes: {

        cors: {

          origin: [
            "http://localhost:5173",
            "https://thewanderingdesk.netlify.app"
          ],

          credentials:
            true

        }

      }

    });

  await server.register(Cookie);

  await server.register(jwt);

  await server.register([

    Inert,

    Vision,

    {
      plugin:
        HapiSwagger,

      options:
        swaggerOptions,
    },

  ]);

  server.validator(Joi);

  server.views({

    engines: {

      hbs:
        Handlebars,

    },

    relativeTo:
      __dirname,

    path:
      "./views",

    layoutPath:
      "./views/layouts",

    partialsPath:
      "./views/partials",

    layout:
      true,

    isCached:
      false,

  });

  server.auth.strategy(
    "session",
    "cookie",
    {

      cookie: {

        name:
          process.env.cookie_name,

        password:
          process.env.cookie_password,

        isSecure:
          process.env.NODE_ENV === "production",

        isSameSite:
          "Lax",

      },

      redirectTo:
        "/",

      validate:
        accountsController.validate,

    }
  );

  server.auth.strategy(
    "jwt",
    "jwt",
    {

      key:
        process.env.cookie_password,

      validate,

      verifyOptions: {

        algorithms: [
          "HS256"
        ]

      },

    }
  );

  server.auth.default(
    "session"
  );

  db.init("mongo");

  server.route(webRoutes);

  server.route(apiRoutes);

  await server.start();

  console.log(
    "Server running on %s",
    server.info.uri
  );

}

process.on(
  "unhandledRejection",
  (err) => {

    console.log(err);

    process.exit(1);

  }
);

init();