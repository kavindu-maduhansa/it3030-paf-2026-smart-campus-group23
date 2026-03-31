import React, { useEffect, useState } from 'react';
import { Plus, Search, Tag, MapPin, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../tickets.css';

interface Ticket {
  id: number;
  category: string;
  description: string;
  priority: string;
  status: string;
  preferredContact: string;
  resource?: { name: string; location: string };
  createdAt: string;
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle size={16} />;
      case 'IN_PROGRESS': return <Clock size={16} />;
      case 'RESOLVED': return <CheckCircle size={16} />;
      case 'CLOSED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      default: return null;
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <div>
          <h1>Incident Dashboard</h1>
          <p>Manage and track maintenance requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
          <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Log New Ticket
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search tickets by category or description..." 
          className="form-control"
          style={{ paddingLeft: '40px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <p>No tickets found. Create your first maintenance request!</p>
        </div>
      ) : (
        <div className="ticket-grid">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => navigate(`/tickets/${ticket.id}`)}>
              <div className={`status-badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                {getStatusIcon(ticket.status)}
                <span style={{ marginLeft: '5px' }}>{ticket.status}</span>
              </div>
              
              <div style={{ marginRight: '100px' }}>
                 <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8' }}>{ticket.category}</h3>
              </div>
              
              <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                {ticket.description.length > 80 ? ticket.description.substring(0, 80) + '...' : ticket.description}
              </p>

              <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={14} />
                  <span className={`priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                </div>
                {ticket.resource && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} />
                    <span>{ticket.resource.location}</span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#999' }}>
                Created on: {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
