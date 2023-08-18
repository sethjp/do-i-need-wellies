import { RainLevel } from "../../src/util/rain/rain-level/rain-level";
import { StaticClock } from "./static-clock";

export const VERY_HEAVY_RAIN = RainLevel.ofMillimeters(37.4);
export const NO_RAIN = RainLevel.NONE;
export const ARBITRARY_DAY = -1;

export const globalStaticClock = new StaticClock(0);