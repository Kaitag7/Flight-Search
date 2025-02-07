import { Flight } from './lib/types'
import { formatDateTime } from './lib/format'

interface Props {
    selectedFlight: Flight | null;
    closeModal: () => void;
    showToast: () => void;
}

const ModalFlight: React.FC<Props> = ({ selectedFlight, closeModal, showToast }) => {
    if (!selectedFlight) return null

    const handleBuy = () => {
      closeModal();
      showToast();
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>

            <h2>Flight Details</h2>

            <div className="modal-content">
              {selectedFlight.logoUrl && (
                <img src={selectedFlight.logoUrl} alt="airline logo" className="modal-logo" />
              )}
              <p><strong>Airline:</strong> {selectedFlight.airline_name}</p>
              <p><strong>Departure:</strong> {formatDateTime(selectedFlight.departure_time)}</p>
              <p><strong>Arrival:</strong> {formatDateTime(selectedFlight.arrival_time)}</p>
              <p><strong>Price:</strong> ${selectedFlight.price}</p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn btn-buy" onClick={handleBuy}>Buy</button>
            </div>
          </div>
        </div>
    )
}

export default ModalFlight