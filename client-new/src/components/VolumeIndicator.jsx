import './VolumeIndicator.css';

function VolumeIndicator({ volume, isActive }) {
  const volumePercent = volume * 100;
  
  return (
    <div className="volume-indicator">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill"
          style={{ width: `${isActive ? volumePercent : 0}%` }}
        ></div>
      </div>
      <div className="volume-labels">
        <span>0%</span>
        <span>{volumePercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default VolumeIndicator;