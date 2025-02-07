interface Flight {
    airline_name: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    logoUrl?: string;
}
  
interface Airport {
    skyId: string;
    entityId: string;
    presentation: {
      title: string;
      suggestionTitle: string;
      subtitle: string;
    };
    navigation: {
      entityId: string;
      relevantFlightParams: {
        skyId: string;
      };
    };
}
  
interface SearchAirportResponse {
    status: boolean;
    data: Airport[];
}
  
  interface FlightLeg {
    departure: string;
    arrival: string;
    carriers: {
      marketing: {
        name: string;
        logoUrl: string;
      }[];
    };
}
  
interface FlightItinerary {
    legs: FlightLeg[];
    price: {
      raw: number;
    };
}
  
interface FlightSearchResponse {
    status: boolean;
    data: {
      context: {
        status: string;
        totalResults: number;
      };
      itineraries: FlightItinerary[];
    };
}

export type { Flight, Airport, SearchAirportResponse, FlightItinerary, FlightSearchResponse }
  