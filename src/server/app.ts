// Import favicon from 'serve-favicon';
// import configuration from '@feathersjs/configuration';

import express from "@feathersjs/express";
import feathers, { HookContext as FeathersHookContext } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import appHooks from "./app.hooks";
import channels from "./channels";
import logger from "./logger";
import middleware from "./middleware";
import services from "./services";

import type { Application } from "./declarations";

// console.log("### APP.TS ###");

// Don't remove this comment. It's needed to format import lines nicely.

process.env.NODE_CONFIG_DIR = path.join(__dirname, "config/");
// Process.env['NODE_ENV'] = 'production';

// console.log("NODE_CONFIG_DIR", process.env.NODE_CONFIG_DIR);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const configuration = require("@feathersjs/configuration");

const app: Application = express(feathers());

export type HookContext<T = any> = {
	app: Application;
} & FeathersHookContext<T>;

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression, favicon and body parsing
app.use(
	helmet({
		contentSecurityPolicy: false,
	}),
);
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
// app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
if (process.env.NODE_ENV === "development") app.configure(express.rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);

// Set up our services (see `services/index.ts`)
app.configure(services);

// Set up event channels (see channels.ts)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

export default app;
