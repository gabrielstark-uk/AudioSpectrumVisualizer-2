import './DetectionDisplay.css';

function DetectionDisplay({ 
  soundCannonResult, 
  voiceToSkullResult, 
  laserModulationResult, 
  rfChipResult,
  isActive 
}) {
  const hasDetections = soundCannonResult || voiceToSkullResult || laserModulationResult || rfChipResult;
  
  if (!isActive || !hasDetections) {
    return null;
  }
  
  return (
    <div className="detection-display">
      <h2 className="detection-title">Harmful Frequency Detection</h2>
      
      <div className="detection-grid">
        {soundCannonResult && (
          <DetectionCard
            title="Sound Cannon"
            result={soundCannonResult}
            color="#ef4444"
          />
        )}
        
        {voiceToSkullResult && (
          <DetectionCard
            title="Voice-to-Skull (V2K)"
            result={voiceToSkullResult}
            color="#f59e0b"
          />
        )}
        
        {laserModulationResult && (
          <DetectionCard
            title="Laser Modulation"
            result={laserModulationResult}
            color="#10b981"
          />
        )}
        
        {rfChipResult && (
          <DetectionCard
            title="RF Chip Signal"
            result={rfChipResult}
            color="#3b82f6"
          />
        )}
      </div>
    </div>
  );
}

function DetectionCard({ title, result, color }) {
  const confidencePercent = result.confidence * 100;
  
  return (
    <div className="detection-card" style={{ borderColor: color }}>
      <div className="detection-header" style={{ backgroundColor: color }}>
        <h3>{title}</h3>
      </div>
      <div className="detection-content">
        <div className="detection-info">
          <div className="detection-label">Confidence:</div>
          <div className="detection-value">{confidencePercent.toFixed(1)}%</div>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${confidencePercent}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
        
        <div className="detection-info">
          <div className="detection-label">Frequency:</div>
          <div className="detection-value">
            {result.frequency != null && !isNaN(result.frequency)
              ? (result.frequency >= 1000
                  ? (result.frequency / 1000).toFixed(2) + ' kHz'
                  : result.frequency.toFixed(2) + ' Hz')
              : 'Unknown'}
          </div>
        </div>
        
        <div className="detection-info">
          <div className="detection-label">Pattern:</div>
          <div className="detection-value">{result.pattern || 'Unknown'}</div>
        </div>
        
        {result.confidence > 0.9 && (
          <div className="detection-alert" style={{ color }}>
            Countermeasure activated - Tarkan's Şımarık playing at MAXIMUM VOLUME
          </div>
        )}
      </div>
    </div>
  );
}

export default DetectionDisplay;