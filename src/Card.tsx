import React from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { Flight } from './lib/types';
import { CARD_HEIGHT, CARD_WIDTH, COLUMN_COUNT, GAP, GRID_WIDTH } from './lib/const';
import { formatDateTime } from './lib/format';

interface Props {
    flights: Flight[];
    openModal: (flight: Flight) => void
}

export const Card: React.FC<Props> = ({ flights, openModal }) => {
    const rowCount = Math.ceil(flights.length / COLUMN_COUNT);

    const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * COLUMN_COUNT + columnIndex;
      
      if (index >= flights.length) return null;
  
      const flight = flights[index];
  
      return (
        <div
          className="flight-card"
          style={{
            ...style,
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            marginRight:`${GAP}px`,
            marginBottom: `${GAP}px`,
          }}
          onClick={() => openModal(flight)}
        >
          <div className="card-content">
            <div className="airline-info">
              {flight.logoUrl && <img src={flight.logoUrl} alt="airline logo" className="airline-logo" />}
              <h3>{flight.airline_name || 'N/A'}</h3>
            </div>
            <p><strong>Departure:</strong> {formatDateTime(flight.departure_time)}</p>
            <p><strong>Arrival:</strong> {formatDateTime(flight.arrival_time)}</p>
            <p><strong>Price:</strong> {flight.price ? `$${flight.price}` : 'N/A'}</p>
          </div>
        </div>
      );
    };
  
    return (
      <section className="results-section">
        <h2>Flight Results</h2>
        <Grid
          columnCount={COLUMN_COUNT}
          columnWidth={() => CARD_WIDTH + GAP}
          rowCount={rowCount}
          rowHeight={() => CARD_HEIGHT + GAP}
          width={GRID_WIDTH}
          height={900}
        >
          {Cell}
        </Grid>
      </section>
    );
}
