// Minimal country centroid lookup by ISO3 (lat, lon).
// Add entries as needed. Values are approximate country centroids.
const centroids: Record<string, [number, number]> = {
  NPL: [28.3949, 84.1240],
  JPN: [36.2048, 138.2529],
  CHN: [35.8617, 104.1954],
  IND: [20.5937, 78.9629],
  MDG: [-18.7669, 46.8691],
  AUT: [47.5162, 14.5501],
  BHS: [25.0343, -77.3963],
  BLZ: [17.1899, -88.4976],
  CUB: [21.5218, -77.7812],
  GTM: [15.7835, -90.2308],
  HND: [15.2, -86.2419],
  MEX: [23.6345, -102.5528],
  NIC: [12.8654, -85.2072],
  SLV: [13.7942, -88.8965],
  SRB: [44.0165, 21.0059],
  ESP: [40.4637, -3.7492],
  BEL: [50.5039, 4.4699],
  IDN: [-0.7893, 113.9213],
  COL: [4.5709, -74.2973],
  PHL: [12.8797, 121.7740],
  FRA: [46.2276, 2.2137],
  GRC: [39.0742, 21.8243],
  CHE: [46.8182, 8.2275],
  DEU: [51.1657, 10.4515],
  ITA: [41.8719, 12.5674],
  UKR: [48.3794, 31.1656],
  AUT: [47.5162, 14.5501],
};

export default centroids;
