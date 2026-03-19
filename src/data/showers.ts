/**
 * Major meteor showers — ~30 significant annual showers.
 * Source: IAU Meteor Data Center + IMO Working List.
 */

export interface MeteorShower {
  /** Unique identifier */
  id: string
  /** Common name */
  name: string
  /** IAU 3-letter code */
  code: string
  /** Radiant Right Ascension in degrees */
  radiantRA: number
  /** Radiant Declination in degrees */
  radiantDec: number
  /** Peak solar longitude in degrees */
  solarLon: number
  /** Approximate peak date (MMM DD) */
  peakDate: string
  /** Activity start date (MMM DD) */
  start: string
  /** Activity end date (MMM DD) */
  end: string
  /** Zenithal Hourly Rate at peak */
  zhr: number
  /** Geocentric velocity in km/s */
  speed: number
  /** Parent body (comet or asteroid) */
  parentBody?: string
}

export const METEOR_SHOWERS: readonly MeteorShower[] = [
  { id:'quadrantids',     name:'Quadrantids',         code:'QUA', radiantRA:230.1, radiantDec:48.5,  solarLon:283.16, peakDate:'Jan 04', start:'Dec 28', end:'Jan 12',  zhr:110, speed:41, parentBody:'2003 EH1' },
  { id:'lyrids',          name:'Lyrids',              code:'LYR', radiantRA:271.4, radiantDec:33.6,  solarLon:32.32,  peakDate:'Apr 22', start:'Apr 14', end:'Apr 30',  zhr:18,  speed:49, parentBody:'C/1861 G1 (Thatcher)' },
  { id:'eta-aquariids',   name:'Eta Aquariids',       code:'ETA', radiantRA:338.0, radiantDec:-1.0,  solarLon:45.5,   peakDate:'May 06', start:'Apr 19', end:'May 28',  zhr:50,  speed:66, parentBody:'1P/Halley' },
  { id:'arietids',        name:'Arietids',            code:'ARI', radiantRA:44.0,  radiantDec:24.0,  solarLon:77.0,   peakDate:'Jun 07', start:'May 14', end:'Jun 24',  zhr:54,  speed:39, parentBody:'96P/Machholz' },
  { id:'s-delta-aquariids',name:'Southern Delta Aquariids',code:'SDA',radiantRA:339.0,radiantDec:-16.0,solarLon:125.0,peakDate:'Jul 30', start:'Jul 12', end:'Aug 23', zhr:16,  speed:41 },
  { id:'alpha-capricornids',name:'Alpha Capricornids', code:'CAP', radiantRA:307.0, radiantDec:-10.0, solarLon:127.0,  peakDate:'Jul 30', start:'Jul 03', end:'Aug 15',  zhr:5,   speed:23, parentBody:'169P/NEAT' },
  { id:'perseids',        name:'Perseids',            code:'PER', radiantRA:48.0,  radiantDec:58.0,  solarLon:140.0,  peakDate:'Aug 12', start:'Jul 17', end:'Aug 24',  zhr:100, speed:59, parentBody:'109P/Swift-Tuttle' },
  { id:'kappa-cygnids',   name:'Kappa Cygnids',       code:'KCG', radiantRA:286.0, radiantDec:59.0,  solarLon:145.0,  peakDate:'Aug 17', start:'Aug 03', end:'Aug 25',  zhr:3,   speed:25 },
  { id:'aurigids',        name:'Aurigids',            code:'AUR', radiantRA:91.0,  radiantDec:39.0,  solarLon:158.6,  peakDate:'Sep 01', start:'Aug 28', end:'Sep 05',  zhr:6,   speed:66, parentBody:'C/1911 N1 (Kiess)' },
  { id:'draconids',       name:'Draconids',           code:'DRA', radiantRA:262.0, radiantDec:54.0,  solarLon:195.4,  peakDate:'Oct 08', start:'Oct 06', end:'Oct 10',  zhr:10,  speed:20, parentBody:'21P/Giacobini-Zinner' },
  { id:'orionids',        name:'Orionids',            code:'ORI', radiantRA:95.0,  radiantDec:16.0,  solarLon:208.0,  peakDate:'Oct 21', start:'Oct 02', end:'Nov 07',  zhr:20,  speed:66, parentBody:'1P/Halley' },
  { id:'s-taurids',       name:'Southern Taurids',    code:'STA', radiantRA:52.0,  radiantDec:13.0,  solarLon:220.7,  peakDate:'Nov 05', start:'Sep 10', end:'Nov 20',  zhr:5,   speed:27, parentBody:'2P/Encke' },
  { id:'n-taurids',       name:'Northern Taurids',    code:'NTA', radiantRA:58.0,  radiantDec:22.0,  solarLon:230.0,  peakDate:'Nov 12', start:'Oct 20', end:'Dec 10',  zhr:5,   speed:29, parentBody:'2P/Encke' },
  { id:'leonids',         name:'Leonids',             code:'LEO', radiantRA:152.0, radiantDec:22.0,  solarLon:235.27, peakDate:'Nov 17', start:'Nov 06', end:'Nov 30',  zhr:15,  speed:71, parentBody:'55P/Tempel-Tuttle' },
  { id:'andromedids',     name:'Andromedids',         code:'AND', radiantRA:25.0,  radiantDec:37.0,  solarLon:240.0,  peakDate:'Dec 03', start:'Nov 25', end:'Dec 06',  zhr:3,   speed:19, parentBody:'3D/Biela' },
  { id:'phoenicids',      name:'Phoenicids',          code:'PHO', radiantRA:18.0,  radiantDec:-53.0, solarLon:254.25, peakDate:'Dec 02', start:'Nov 28', end:'Dec 09',  zhr:5,   speed:18, parentBody:'289P/Blanpain' },
  { id:'puppid-velids',   name:'Puppid-Velids',       code:'PUP', radiantRA:123.0, radiantDec:-45.0, solarLon:255.0,  peakDate:'Dec 07', start:'Dec 01', end:'Dec 15',  zhr:10,  speed:40 },
  { id:'monocerotids',    name:'Monocerotids',        code:'MON', radiantRA:100.0, radiantDec:8.0,   solarLon:261.0,  peakDate:'Dec 11', start:'Nov 27', end:'Dec 17',  zhr:3,   speed:42, parentBody:'C/1917 F1 (Mellish)' },
  { id:'sigma-hydrids',   name:'Sigma Hydrids',       code:'HYD', radiantRA:127.0, radiantDec:2.0,   solarLon:262.0,  peakDate:'Dec 12', start:'Dec 03', end:'Dec 15',  zhr:3,   speed:58 },
  { id:'geminids',        name:'Geminids',            code:'GEM', radiantRA:112.0, radiantDec:33.0,  solarLon:262.2,  peakDate:'Dec 14', start:'Dec 04', end:'Dec 17',  zhr:150, speed:35, parentBody:'3200 Phaethon' },
  { id:'comae-berenicids',name:'Comae Berenicids',    code:'COM', radiantRA:175.0, radiantDec:18.0,  solarLon:271.0,  peakDate:'Dec 19', start:'Dec 12', end:'Jan 02',  zhr:3,   speed:65 },
  { id:'ursids',          name:'Ursids',              code:'URS', radiantRA:217.0, radiantDec:76.0,  solarLon:270.7,  peakDate:'Dec 22', start:'Dec 17', end:'Dec 26',  zhr:10,  speed:33, parentBody:'8P/Tuttle' },
] as const
