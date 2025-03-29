import React, { useState, useContext } from 'react';
import { useWeb3 } from '@3rdweb/hooks';
import { useBlockchain } from '../../contexts/BlockchainContext';
import MediaUpload from './MediaUpload';
import { createReport } from '../../utils/blockchainUtils';
import { validateEmergencyReport } from '../../utils/validation';

const ReportPortal = () => {
  const { address } = useWeb3();
  const { submitEmergencyReport } = useBlockchain();
  const [formData, setFormData] = useState({
    emergencyType: 'natural',
    location: '',
    description: '',
    severity: 3,
    mediaCIDs: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmergencyReport(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const reportData = {
        ...formData,
        coordinates: await getCoordinates(formData.location),
        timestamp: Math.floor(Date.now() / 1000),
        reporter: address
      };

      const tx = await submitEmergencyReport(reportData);
      setTxHash(tx.hash);
      
      await tx.wait();
      setFormData({
        emergencyType: 'natural',
        location: '',
        description: '',
        severity: 3,
        mediaCIDs: []
      });
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      return data.features[0].center;
    } catch (error) {
      throw new Error('Location lookup failed');
    }
  };

  const handleMediaUpload = (cids) => {
    setFormData(prev => ({
      ...prev,
      mediaCIDs: [...prev.mediaCIDs, ...cids]
    }));
  };

  return (
    <div className="report-portal">
      <h2>Emergency Reporting System</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Emergency Type</label>
          <select 
            value={formData.emergencyType}
            onChange={(e) => setFormData({...formData, emergencyType: e.target.value})}
          >
            <option value="natural">Natural Disaster</option>
            <option value="medical">Medical Emergency</option>
            <option value="infrastructure">Infrastructure Failure</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Enter location or address"
          />
          {errors.location && <span className="error">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label>Severity Level</label>
          <div className="severity-scale">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                type="button"
                key={level}
                className={`severity-btn ${formData.severity === level ? 'active' : ''}`}
                onClick={() => setFormData({...formData, severity: level})}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Provide detailed information about the emergency"
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <MediaUpload 
          onUploadComplete={handleMediaUpload}
          maxFiles={5}
          acceptedTypes="image/*,video/*"
        />

        {txHash && (
          <div className="tx-status">
            <p>Transaction Submitted: 
              <a href={`${process.env.REACT_APP_BLOCK_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                View on Explorer
              </a>
            </p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Report Emergency'}
        </button>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
      </form>
    </div>
  );
};

export default ReportPortal;
