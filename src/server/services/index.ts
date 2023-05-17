import routes from "./routes/routes.service";

import type { Application } from "../declarations";

import areas from "./areas/areas.service";

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
	app.configure(routes);
	app.configure(areas);
}
