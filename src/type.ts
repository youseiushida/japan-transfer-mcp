/**
 * Parameters for the suggest API query.
 */
export type SuggestQuery = {
    /**
     * Callback function name for JSONP response.
     */
    callback?: string
    /**
     * Query string for partial match search.
     */
    query: string
    /**
     * Maximum number of stations/airports to return.
     */
    max_R?: number
    /**
     * Maximum number of bus stops/ports to return.
     */
    max_B?: number
    /**
     * Maximum number of spots to return.
     */
    max_S?: number
    /**
     * Response format.
     */
    format?: "jsonp" | "json"
    /**
     * Facility types to include (comma-separated: R,B,S; empty string for all).
     */
    kinds?: string
    /**
     * Spot types to exclude.
     */
    excludeSpot?: string
    /**
     * Additional filter for stations/airports.
     */
    Rfilter?: string
    /**
     * Additional filter for bus stops/ports.
     */
    Bfilter?: string
    /**
     * Coordinate system ("tky", "jpn", or "wgs84").
     */
    geosys?: "tky" | "jpn" | "wgs84"
    /**
     * Unit and format for coordinates ("ms" or "deg").
     */
    geounit?: "ms" | "deg"
    /**
     * Cache buster or timestamp.
     */
    _: number
}

/**
 * Response type for the Suggest API (/api/compat/suggest/agg).
 */
export type SuggestResponse = {
    /**
     * Response metadata.
     */
    respInfo: {
        /** Library version. */
        libVersion: string
        /** Request timestamp (epoch seconds). */
        timestamp: number
        /** Data update datetime (e.g. "2025-07-03 21:02:00"). */
        dataTime: string
        /** Request status (e.g. "OK"). */
        status: string
        /** Data version. */
        version: string
    }
    /**
     * List of railway stations / airports.
     */
    R?: SuggestPlaceR[]
    /**
     * List of bus stops / ports.
     */
    B?: SuggestPlaceB[]
    /**
     * List of spots.
     */
    S?: SuggestPlaceS[]
}

/**
 * Railway station / airport element.
 */
export type SuggestPlaceR = {
    /** Facility name. */
    poiName: string
    /** Prefecture name. */
    prefName: string
    /** Reading (kana). */
    poiYomi: string
    /** City/ward/town/village name. */
    cityName: string
    /** Facility type ("R"). */
    nodeKind: "R"
    /** Location (longitude/latitude as string). */
    location: {
        lon: string
        lat: string
    }
    /** City code. */
    cityCode: number
}

/**
 * Bus stop / port element.
 */
export type SuggestPlaceB = {
    /** Facility name. */
    poiName: string
    /** Prefecture name. */
    prefName: string
    /** Reading (kana). */
    poiYomi: string
    /** City/ward/town/village name. */
    cityName: string
    /** Facility type ("B"). */
    nodeKind: "B"
    /** Location (longitude/latitude as string). */
    location: {
        lon: string
        lat: string
    }
    /** City code. */
    cityCode: number
}

/**
 * Spot element.
 */
export type SuggestPlaceS = {
    /** Facility name. */
    poiName: string
    /** Spot code. */
    spotCode: string
    /** Facility type ("S"). */
    nodeKind: "S"
    /** City/ward/town/village name. */
    cityName: string
    /** Prefecture name. */
    prefName: string
    /** Reading (kana). */
    poiYomi: string
    /** Provider information. */
    provider: {
        /** Provider label. */
        label: string
        /** Provider identity (URL or domain). */
        identity: string
        /** Provider logo URL. */
        logo: string
    }
    /** City code. */
    cityCode: number
    /** Location (longitude/latitude as string). */
    location: {
        lon: string
        lat: string
    }
    /** Address. */
    address: string
}

/**
 * Query parameters for route search API (`/norikae/cgi/nori.cgi`).
 * See: https://www.jorudan.co.jp/norikae/cgi/nori.cgi
 */
export type RouteSearchQuery = {
    /** Departure station name (UTF-8 URL encoded). */
    eki1: string
    /** Arrival station name (UTF-8 URL encoded). */
    eki2: string
    /** Enable via stations input. 1 = enabled, -1 = disabled. */
    via_on: 1 | -1
    /** Via station 1 (optional, empty string if not specified). */
    eki3?: string
    /** Via station 2 (optional, empty string if not specified). */
    eki4?: string
    /** Via station 3 (optional, empty string if not specified). */
    eki5?: string
    /** Via station 4 (optional, empty string if not specified). */
    eki6?: string
    /** Year (YYYY, 4 digits). */
    Dyy: number
    /** Month (1-12). */
    Dmm: number
    /** Day (1-31). */
    Ddd: number
    /** Hour (0-23). */
    Dhh: number
    /** Minute (tens place, 0-5). */
    Dmn1: number
    /** Minute (ones place, 0-9). */
    Dmn2: number
    /** Search time type: 0=departure, 1=arrival, 2=first train, 3=last train. */
    Cway: 0 | 1 | 2 | 3
    /** "Depart as late as possible" flag. 1 = checked, undefined = unchecked. */
    Clate?: 1
    /** Fare display type: 1=IC card, 2=paper ticket. */
    Cfp: 1 | 2
    /** Discount type (see docs for values). */
    Czu: 1 | 2 | 3 | 4 | 5 | 6
    /** Commuter pass type. */
    C7: 1 | 2 | 3 | 4 | 5
    /** Airplane usage: 0=any, 1=not used. */
    C2: 0 | 1
    /** Highway bus usage: 0=any, 1=not used. */
    C3: 0 | 1
    /** Limited express usage: 0=any, 1=not used, 3=prefer, 4=avoid. */
    C1: 0 | 1 | 3 | 4
    /** Car/taxi search toggle. 1 = enabled, undefined = disabled. */
    cartaxy?: 1
    /** Bikeshare search toggle. 1 = enabled, undefined = disabled. */
    bikeshare?: 1
    /** Sort order: "rec" | "time" | "fast" | "change" | "cheap". */
    sort: "rec" | "time" | "fast" | "change" | "cheap"
    /** Seat type priority: 0=reserved, 1=non-reserved, 2=green, 5=any. */
    C4: 0 | 1 | 2 | 5
    /** Preferred train: 0=nozomi, 1=hikari, 2=local, 3=direct. */
    C5: 0 | 1 | 2 | 3
    /** Transfer margin: 1=short, 2=standard, 3=ample. */
    C6: 1 | 2 | 3
    /** Search button value (usually "検索"). */
    S: string
    /** Map UI parameter (optional). */
    Cmap1?: string
    /** Referrer code (optional, e.g. "nr"). */
    rf?: string
    /** Page number (optional, default 0). */
    pg?: number
    /** Input widget status for eki1 (optional). */
    eok1?: string
    /** Input widget status for eki2 (optional). */
    eok2?: string
    /** Input widget status for eki3 (optional). */
    eok3?: string
    /** Input widget status for eki4 (optional). */
    eok4?: string
    /** Input widget status for eki5 (optional). */
    eok5?: string
    /** Input widget status for eki6 (optional). */
    eok6?: string
    /** Search start flag (usually 1). */
    Csg: 1
    /** "Stop at via station" flag (optional, only if via_on=1). */
    vstp?: 1
}

/**
 * Schema for the route search result.
 */
export interface RouteSearchResult {
  /**
   * List of route results.
   */
  routes: Route[];
  /**
   * Timestamp when the search was executed (ISO string).
   */
  searchTime: string;
}


/**
 * Represents a single route result.
 */
export interface Route {
  /**
   * Unique route ID.
   */
  id: string;
  /**
   * Route number (for display).
   */
  routeNumber: number;
  /**
   * Evaluation tags for the route.
   */
  tags: RouteTag[];
  /**
   * Time information for the route.
   */
  timeInfo: TimeInfo;
  /**
   * Fare information for the route.
   */
  fareInfo: FareInfo;
  /**
   * Total required time (minutes).
   */
  totalTime: number;
  /**
   * Number of transfers.
   */
  transfers: number;
  /**
   * Total distance (km).
   */
  totalDistance?: number;
  /**
   * CO2 emission information.
   */
  co2Info?: CO2Info;
  /**
   * Detailed route segments.
   */
  segments: RouteSegment[];
  /**
   * Route notices and special information.
   */
  routeNotices?: RouteNotice[];
}

/**
 * Represents a tag associated with a route.
 */
export interface RouteTag {
  /**
   * Type of the tag.
   */
  type: 'fast' | 'comfortable' | 'car' | 'cheap' | 'few_transfers';
  /**
   * Display text for the tag.
   */
  label: string;
  /**
   * Icon information for the tag.
   */
  icon?: string;
}

/**
 * Represents time information for a route.
 */
export interface TimeInfo {
  /**
   * Departure time.
   */
  departure: string;
  /**
   * Arrival time.
   */
  arrival: string;
  /**
   * Departure time in minutes (for display).
   */
  departureMinutes?: string;
  /**
   * Arrival time in minutes (for display).
   */
  arrivalMinutes?: string;
}

/**
 * Represents fare information for a route.
 */
export interface FareInfo {
  /**
   * Total fare (in yen).
   */
  total: number;
  /**
   * Additional fare information.
   */
  additionalInfo?: string;
  /**
   * Fare breakdown.
   */
  breakdown?: FareBreakdown[];
}

/**
 * Represents a fare breakdown.
 */
export interface FareBreakdown {
  /**
   * Segment name.
   */
  segment: string;
  /**
   * Fare amount (in yen).
   */
  fare: number;
  /**
   * Fare type.
   */
  type: 'train' | 'bus' | 'taxi' | 'other';
}

/**
 * Represents CO2 emission information.
 */
export interface CO2Info {
  /**
   * CO2 emission amount.
   */
  amount: string;
  /**
   * Reduction rate compared to car (percentage).
   */
  reductionRate?: string;
  /**
   * Comparison reference.
   */
  comparison?: string;
}

/**
 * Represents a segment of a route.
 */
export interface RouteSegment {
  /**
   * Segment type.
   */
  type: 'station' | 'transport' | 'transfer';
  /**
   * Station information (if type is station).
   */
  station?: StationInfo;
  /**
   * Transport information (if type is transport).
   */
  transport?: TransportInfo;
  /**
   * Transfer information (if type is transfer).
   */
  transfer?: TransferInfo;
}

/**
 * Represents station information.
 */
export interface StationInfo {
  /**
   * Station name.
   */
  name: string;
  /**
   * Station type.
   */
  type: 'start' | 'end' | 'transfer';
  /**
   * Time information.
   */
  time?: string;
  /**
   * Weather information.
   */
  weather?: WeatherInfo;
  /**
   * Platform information.
   */
  platform?: string;
  /**
   * Available services.
   */
  services?: StationService[];
}

/**
 * Represents transport information.
 */
export interface TransportInfo {
  /**
   * Transport type.
   */
  type: 'train' | 'subway' | 'bus' | 'car' | 'taxi' | 'walk';
  /**
   * Line name.
   */
  lineName: string;
  /**
   * Direction.
   */
  direction?: string;
  /**
   * Operator.
   */
  operator?: string;
  /**
   * Time information.
   */
  timeInfo: {
    /**
     * Departure time.
     */
    departure: string;
    /**
     * Arrival time.
     */
    arrival: string;
    /**
     * Duration (minutes).
     */
    duration: number;
  };
  /**
   * Fare (in yen).
   */
  fare?: number;
  /**
   * Distance.
   */
  distance?: string;
  /**
   * Line color.
   */
  lineColor?: string;
  /**
   * Notices.
   */
  notices?: string[];
}

/**
 * Represents transfer information.
 */
export interface TransferInfo {
  /**
   * Transfer time (minutes).
   */
  transferTime: number;
  /**
   * Wait time (minutes).
   */
  waitTime: number;
  /**
   * Transfer description.
   */
  description?: string;
}

/**
 * Represents weather information.
 */
export interface WeatherInfo {
  /**
   * Weather condition.
   */
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  /**
   * Weather icon URL.
   */
  iconUrl?: string;
  /**
   * Weather description.
   */
  description: string;
}

/**
 * Represents a station service.
 */
export interface StationService {
  /**
   * Service type.
   */
  type: 'timetable' | 'map' | 'route_map' | 'floor_plan' | 'coupon' | 'gourmet' | 'exit_info';
  /**
   * Service name.
   */
  name: string;
  /**
   * Link URL.
   */
  url?: string;
}

/**
 * Represents a route notice.
 */
export interface RouteNotice {
  /**
   * Type of the notice.
   */
  type: 'route_change' | 'service_disruption' | 'schedule_change' | 'other';
  /**
   * Title.
   */
  title: string;
  /**
   * Detailed information.
   */
  description?: string;
  /**
   * Effective date.
   */
  effectiveDate?: string;
  /**
   * Detailed link.
   */
  detailUrl?: string;
}

/**
 * API response wrapper type.
 */
export interface RouteSearchResponse {
  /**
   * Search result.
   */
  result: RouteSearchResult;
  /**
   * Status.
   */
  status: 'success' | 'error' | 'no_results';
  /**
   * Error message (if status is error).
   */
  error?: string;
  /**
   * Search execution time (milliseconds).
   */
  executionTime?: number;
}

/**
 * Search options.
 */
export interface SearchOptions {
  /**
   * Transport modes.
   */
  transportModes?: TransportMode[];
  /**
   * Priority.
   */
  priority?: 'time' | 'cost' | 'transfers' | 'eco';
  /**
   * Walking speed.
   */
  walkingSpeed?: 'slow' | 'normal' | 'fast';
  /**
   * Maximum number of transfers.
   */
  maxTransfers?: number;
  /**
   * Wheelchair accessible.
   */
  wheelchairAccessible?: boolean;
  /**
   * Use commuter.
   */
  useCommuter?: boolean;
}

/**
 * Transport mode.
 */
export type TransportMode = 'train' | 'subway' | 'bus' | 'car' | 'taxi' | 'walk' | 'bicycle';