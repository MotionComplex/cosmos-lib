export declare const Units: {
    readonly auToKm: (au: number) => number;
    readonly kmToAu: (km: number) => number;
    readonly lyToPc: (ly: number) => number;
    readonly pcToLy: (pc: number) => number;
    readonly pcToKm: (pc: number) => number;
    readonly lyToKm: (ly: number) => number;
    readonly kmToLy: (km: number) => number;
    readonly degToRad: (d: number) => number;
    readonly radToDeg: (r: number) => number;
    readonly arcsecToDeg: (a: number) => number;
    readonly degToArcsec: (d: number) => number;
    /** Right Ascension: hours → degrees */
    readonly hrsToDeg: (h: number) => number;
    /** Right Ascension: degrees → hours */
    readonly degToHrs: (d: number) => number;
    /**
     * Format a distance in km into a human-readable string,
     * automatically choosing the most appropriate unit.
     */
    readonly formatDistance: (km: number) => string;
    /**
     * Format decimal degrees as d°m′s″ (signed).
     * e.g. -16.716 → "-16°42′57.6″"
     */
    readonly formatAngle: (deg: number) => string;
    /**
     * Format Right Ascension in decimal degrees → HH h MM m SS.s s
     * e.g. 83.822 → "5h 35m 17.3s"
     */
    readonly formatRA: (deg: number) => string;
};
