import { Subject } from "rxjs";

const cronCounter$ = new Subject<radarTrap.ICronCounter>();

export { cronCounter$ };
