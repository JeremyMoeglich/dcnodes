const RATIO_DEGREES = 180 / Math.PI;
const RATIO_RADIANS = Math.PI / 180;

export function degrees(radians: number) {
	return radians * RATIO_DEGREES;
}

export function radians(degrees: number) {
	return degrees * RATIO_RADIANS;
}
