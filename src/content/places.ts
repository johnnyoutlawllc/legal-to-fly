/** Places with their own "Can I fly a drone in ___?" page. Each page is a
 *  server-rendered briefing for the city center plus the live check, so it
 *  answers the search on its own and gives AI answer engines real text to
 *  quote. Coordinates are city centers; add a place by adding a row. */

export interface Place {
  slug: string;
  name: string;
  state: string;
  stateName: string;
  lat: number;
  lng: number;
}

export const PLACES: Place[] = [
  { slug: "rockwall-tx", name: "Rockwall", state: "TX", stateName: "Texas", lat: 32.9312, lng: -96.4597 },
  { slug: "dallas-tx", name: "Dallas", state: "TX", stateName: "Texas", lat: 32.7767, lng: -96.797 },
  { slug: "fort-worth-tx", name: "Fort Worth", state: "TX", stateName: "Texas", lat: 32.7555, lng: -97.3308 },
  { slug: "plano-tx", name: "Plano", state: "TX", stateName: "Texas", lat: 33.0198, lng: -96.6989 },
  { slug: "frisco-tx", name: "Frisco", state: "TX", stateName: "Texas", lat: 33.1507, lng: -96.8236 },
  { slug: "mckinney-tx", name: "McKinney", state: "TX", stateName: "Texas", lat: 33.1972, lng: -96.6398 },
  { slug: "garland-tx", name: "Garland", state: "TX", stateName: "Texas", lat: 32.9126, lng: -96.6389 },
  { slug: "rowlett-tx", name: "Rowlett", state: "TX", stateName: "Texas", lat: 32.9029, lng: -96.5639 },
  { slug: "royse-city-tx", name: "Royse City", state: "TX", stateName: "Texas", lat: 32.9751, lng: -96.3325 },
  { slug: "heath-tx", name: "Heath", state: "TX", stateName: "Texas", lat: 32.8365, lng: -96.4747 },
  { slug: "arlington-tx", name: "Arlington", state: "TX", stateName: "Texas", lat: 32.7357, lng: -97.1081 },
  { slug: "denton-tx", name: "Denton", state: "TX", stateName: "Texas", lat: 33.2148, lng: -97.1331 },
  { slug: "austin-tx", name: "Austin", state: "TX", stateName: "Texas", lat: 30.2672, lng: -97.7431 },
  { slug: "houston-tx", name: "Houston", state: "TX", stateName: "Texas", lat: 29.7604, lng: -95.3698 },
  { slug: "san-antonio-tx", name: "San Antonio", state: "TX", stateName: "Texas", lat: 29.4241, lng: -98.4936 },
  { slug: "new-york-ny", name: "New York City", state: "NY", stateName: "New York", lat: 40.7128, lng: -74.006 },
  { slug: "los-angeles-ca", name: "Los Angeles", state: "CA", stateName: "California", lat: 34.0522, lng: -118.2437 },
  { slug: "chicago-il", name: "Chicago", state: "IL", stateName: "Illinois", lat: 41.8781, lng: -87.6298 },
  { slug: "las-vegas-nv", name: "Las Vegas", state: "NV", stateName: "Nevada", lat: 36.1699, lng: -115.1398 },
  { slug: "miami-fl", name: "Miami", state: "FL", stateName: "Florida", lat: 25.7617, lng: -80.1918 },
  { slug: "orlando-fl", name: "Orlando", state: "FL", stateName: "Florida", lat: 28.5383, lng: -81.3792 },
  { slug: "denver-co", name: "Denver", state: "CO", stateName: "Colorado", lat: 39.7392, lng: -104.9903 },
  { slug: "phoenix-az", name: "Phoenix", state: "AZ", stateName: "Arizona", lat: 33.4484, lng: -112.074 },
  { slug: "seattle-wa", name: "Seattle", state: "WA", stateName: "Washington", lat: 47.6062, lng: -122.3321 },
  { slug: "nashville-tn", name: "Nashville", state: "TN", stateName: "Tennessee", lat: 36.1627, lng: -86.7816 },
  { slug: "washington-dc", name: "Washington", state: "DC", stateName: "District of Columbia", lat: 38.8977, lng: -77.0365 },
  { slug: "grand-canyon-az", name: "Grand Canyon Village", state: "AZ", stateName: "Arizona", lat: 36.0544, lng: -112.1401 },
];

export const placeBySlug = (slug: string) => PLACES.find((p) => p.slug === slug);
export const placeLabel = (p: Place) => `${p.name}, ${p.state}`;
