import { Subject } from "rxjs";

const radarTrapEnabled$ = new Subject<boolean>();

export { radarTrapEnabled$ };
