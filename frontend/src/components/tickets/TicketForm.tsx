import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, X } from 'lucide-react';
import '../../tickets.css';

const TicketForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'MEDIUM',
    preferredContact: '',
    resourceId: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // Mocked fetch for editing - just for demonstration as it's CURD "start"
      fetchTicketData(id);
    }
  }, [id, isEditing]);

  const fetchTicketData = async (ticketId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          category: data.category,
          description: data.description,
          priority: data.priority,
          preferredContact: data.preferredContact,
          resourceId: data.resource?.id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedImages = [...images, ...newFiles].slice(0, 3);
      setImages(updatedImages);

      const newPreviews = updatedImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('ticket', JSON.stringify({
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        preferredContact: formData.preferredContact
      }));

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      formDataToSend.append('reporterId', '1'); // Mocked current user ID
      if (formData.resourceId) {
        formDataToSend.append('resourceId', formData.resourceId);
      }

      const url = isEditing 
        ? `http://localhost:8080/api/tickets/${id}` 
        : 'http://localhost:8080/api/tickets';
      
      const method = isEditing ? 'PUT' : 'POST';

      // For PUT, we might not send images the same way in this simple CRUD
      // But for creation (which is most common first step):
      const response = await fetch(url + (isEditing ? '' : `?reporterId=1${formData.resourceId ? '&resourceId='+formData.resourceId : ''}`), {
        method: method,
        body: isEditing ? JSON.stringify(formData) : formDataToSend,
        headers: isEditing ? { 'Content-Type': 'application/json' } : {}
      });

      if (response.ok) {
        navigate('/tickets');
      } else {
        alert('Failed to save ticket. Please check if backend is running.');
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/tickets')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ color: '#1a73e8' }}>{isEditing ? 'Edit Ticket' : 'Raise Incident Ticket'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form" style={{ marginTop: '20px' }}>
        <div className="form-group">
          <label>Category</label>
          <select 
            name="category" 
            className="form-control" 
            value={formData.category} 
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="IT/Equipment">IT / Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description (Detailed)</label>
          <textarea 
            name="description" 
            className="form-control" 
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe the issue in detail..."
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Contact</label>
            <input 
              type="text" 
              name="preferredContact" 
              className="form-control" 
              value={formData.preferredContact}
              onChange={handleChange}
              placeholder="Email or Phone"
              required
            />
          </div>
        </div>

        {!isEditing && (
          <div className="form-group">
            <label>Attachments (Max 3 Images)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} />
                Select Images
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} disabled={images.length >= 3} />
              </label>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>{images.length}/3 selected</span>
            </div>
            
            <div className="image-preview-container">
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="Preview" className="image-preview" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', borderRadius: '50%', border: 'none', background: '#d32f2f', color: '#fff', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tickets')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            {submitting ? 'Saving...' : (isEditing ? 'Update Ticket' : 'Submit Ticket')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
