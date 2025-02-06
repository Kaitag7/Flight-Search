import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Flight {
  // id: string test
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

interface FlightSearchResponse {
  status: boolean;
  data: {
    context: {
      status: string;
      totalResults: number;
    };
    itineraries: unknown[];
  };
}

const RAPIDAPI_KEY = '5cbccecd61msh9dd0e12271e3eb7p139435jsndc86a28023df';
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

const App: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  
  const [results, setResults] = useState<Flight[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const searchAirport = async (query: string): Promise<Airport | null> => {
    try {
      const response = await axios.get<SearchAirportResponse>(
        `https://${RAPIDAPI_HOST}/api/v1/flights/searchAirport`,
        {
          params: { query },
          headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
          },
        }
      );
      
      if (response.data.status && response.data.data.length > 0) {
        return response.data.data[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const transform = (itineraries: any[]): Flight[] => {
    return itineraries.map((itinerary) => {
      const leg = itinerary.legs[0];
      const marketing = leg?.carriers?.marketing;
      const airlineName = (marketing && marketing.length > 0)
        ? marketing[0].name
        : 'N/A';
      const logoUrl = (marketing && marketing.length > 0)
        ? marketing[0].logoUrl
        : '';
          
      return {
        airline_name: airlineName,
        departure_time: leg?.departure || 'N/A',
        arrival_time: leg?.arrival || 'N/A',
        price: itinerary?.price?.raw || 0,
        logoUrl,
      };
    });
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(false);
    setResults([]);

    try {
      const originAirport = await searchAirport(origin);
      const destinationAirport = await searchAirport(destination);

      if (!originAirport || !destinationAirport) {
        setError('Could not find the selected airport.');
        setLoading(false);
        setHasSearched(true);
        return;
      }

      const originSkyId = originAirport.navigation.relevantFlightParams.skyId;
      const originEntityId = originAirport.navigation.entityId;
      const destinationSkyId = destinationAirport.navigation.relevantFlightParams.skyId;
      const destinationEntityId = destinationAirport.navigation.entityId;

      const flightResponse = await axios.get<FlightSearchResponse>(
        `https://${RAPIDAPI_HOST}/api/v1/flights/searchFlights`,
        {
          params: {
            originSkyId,
            originEntityId,
            destinationSkyId,
            destinationEntityId,
            date: departureDate,
          },
          headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
          },
        }
      );

      if (flightResponse.data.status) {
        const flights = transform(flightResponse.data.data.itineraries);

        setResults(flights);
      } else {
        setError('The flight search was unsuccessful.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while receiving data.');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Flight Search</h1>
      </header>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="origin">Origin</label>
              <input
                id="origin"
                type="text"
                className="form-control"
                placeholder="e.g., JFK or New York"
                value={origin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrigin(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <input
                id="destination"
                type="text"
                className="form-control"
                placeholder="e.g., LAX or Los Angeles"
                value={destination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="departureDate">Departure Date</label>
              <input
                id="departureDate"
                type="date"
                className="form-control"
                value={departureDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartureDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group btn-group">
              <button type="submit" className="btn">
                Search
              </button>
            </div>
          </div>
        </form>
      </section>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}
      {error && <p className="status error">{error}</p>}

      {hasSearched && results.length === 0 && !loading && (
        <p className="status">No search results found.</p>
      )}

      {results.length > 0 && (
        <section className="results-section">
          <h2>Flight Results</h2>
          <div className="results-grid">
            {results.map((flight: Flight, index: number) => (
              <div className="flight-card" key={index}>
                <div className="card-content">
                  <div className="airline-info">
                    {flight.logoUrl && (
                      <img
                        src={flight.logoUrl}
                        alt={`${flight.airline_name} logo`}
                        className="airline-logo"
                      />
                    )}
                    <h3>{flight.airline_name || 'N/A'}</h3>
                  </div>
                  <p>
                    <strong>Departure:</strong> {flight.departure_time || 'N/A'}
                  </p>
                  <p>
                    <strong>Arrival:</strong> {flight.arrival_time || 'N/A'}
                  </p>
                  <p>
                    <strong>Price:</strong> {flight.price ? `$${flight.price}` : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
