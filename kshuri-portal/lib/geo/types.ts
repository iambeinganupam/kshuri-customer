export type GeoSource = 'ip' | 'manual' | 'browser';

export interface GeoCookie {
  city: string;
  region: string;
  lat: number;
  lng: number;
  source: GeoSource;
  ts: number;                              // ms since epoch
}
