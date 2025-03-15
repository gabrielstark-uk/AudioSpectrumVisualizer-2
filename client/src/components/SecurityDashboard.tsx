import React, { useState, useEffect } from 'react';
import { 
  initializeVPN, 
  getVPNConfig, 
  updateVPNConfig, 
  connectVPN, 
  disconnectVPN, 
  checkVPNStatus 
} from '../utils/vpnConfig';
import { initializeAntiMalware, handleThreats } from '../utils/antiMalware';
import { initializeScanner, scanSystem } from '../utils/securityScanner';

const SecurityDashboard: React.FC = () => {
  const [vpnStatus, setVPNStatus] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [vpnConfig, setVPNConfig] = useState(getVPNConfig());

  useEffect(() => {
    // Initialize security systems
    initializeVPN();
    initializeAntiMalware();
    initializeScanner();

    // Check initial VPN status
    setVPNStatus(checkVPNStatus());
  }, []);

  const handleVPNToggle = async () => {
    if (vpnStatus) {
      await disconnectVPN();
    } else {
      await connectVPN();
    }
    setVPNStatus(checkVPNStatus());
  };

  const handleScan = async () => {
    const results = await scanSystem();
    setScanResults(results);
    handleThreats(results);
  };

  const handleConfigUpdate = (field: string, value: any) => {
    const updatedConfig = { ...vpnConfig, [field]: value };
    setVPNConfig(updatedConfig);
    updateVPNConfig(updatedConfig);
  };

  return (
    <div className="security-dashboard">
      <h1>Security Dashboard</h1>

      <div className="vpn-section">
        <h2>VPN Configuration</h2>
        <div className="vpn-status">
          Status: {vpnStatus ? 'Connected' : 'Disconnected'}
          <button onClick={handleVPNToggle}>
            {vpnStatus ? 'Disconnect' : 'Connect'}
          </button>
        </div>
        <div className="vpn-config">
          <label>
            Server:
            <input
              type="text"
              value={vpnConfig.server}
              onChange={(e) => handleConfigUpdate('server', e.target.value)}
            />
          </label>
          <label>
            Protocol:
            <select
              value={vpnConfig.protocol}
              onChange={(e) => handleConfigUpdate('protocol', e.target.value)}
            >
              <option value="udp">UDP</option>
              <option value="tcp">TCP</option>
            </select>
          </label>
          <label>
            Port:
            <input
              type="number"
              value={vpnConfig.port}
              onChange={(e) => handleConfigUpdate('port', parseInt(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="scan-section">
        <h2>System Scan</h2>
        <button onClick={handleScan}>Run System Scan</button>
        <div className="scan-results">
          {scanResults.map((result, index) => (
            <div key={index} className="scan-result">
              <p>File: {result.filePath}</p>
              <p>Status: {result.status}</p>
              <p>Threat Type: {result.threatType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
