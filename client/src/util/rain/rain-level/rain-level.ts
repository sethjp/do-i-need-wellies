export class RainLevel {
	private constructor(private mm: number) {
	}

	get millimetres() {
		return this.mm
	}

	static NONE = this.ofMillimeters(0);

	static ofMillimeters(mm: number) {
		return new RainLevel(mm);
	}
}