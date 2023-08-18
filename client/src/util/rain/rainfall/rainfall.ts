import { RainLevel } from '../rain-level/rain-level';

export class Rainfall {
	constructor(
		private rainLevel: RainLevel,
		private when: number,
	) { }

	get fellOn(): Date {
		return new Date(this.when);
	}

	get amount(): RainLevel {
		return this.rainLevel;
	}
}
