import React, { useState } from 'react';
import axios from 'axios';
import { Airport, Flight, FlightItinerary, FlightSearchResponse, SearchAirportResponse } from './lib/types';
import { RAPIDAPI_HOST, RAPIDAPI_KEY } from './lib/credentials';
import ModalFlight from './ModalFlight';
import { Card } from './Card';

import './App.css';

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

  const transform = (itineraries: FlightItinerary[]): Flight[] => {
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
  
        flights.sort((a, b) => a.price - b.price);
  
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

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const openModal = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const closeModal = () => {
    setSelectedFlight(null);
  };

  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="container">
      <div className="background"></div>
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
                placeholder="JFK or New York"
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
                placeholder="LAX or Los Angeles"
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

      {hasSearched && results.length === 0 && !loading && !error && (
        <p className="status">No search results found.</p>
      )}

      {results.length > 0 && <Card flights={results} openModal={openModal} />}

      {selectedFlight && <ModalFlight selectedFlight={selectedFlight} closeModal={closeModal} showToast={showToast} />}

      {toastVisible && (
        <div className="toast">Flight successfully purchased!</div>
      )}
    </div>
  );
};

export default App;