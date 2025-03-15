import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Configuration
const VPN_CONFIG_DIR = join(__dirname, 'vpn-config');
const VPN_CONFIG_FILE = join(VPN_CONFIG_DIR, 'config.json');
const KILL_SWITCH_SCRIPT = join(VPN_CONFIG_DIR, 'kill-switch.sh');

interface VPNConfig {
  provider: string;
  server: string;
  username: string;
  password: string;
  protocol: 'udp' | 'tcp';
  port: number;
  killSwitchEnabled: boolean;
  dnsLeakProtection: boolean;
}

// Initialize VPN configuration
export function initializeVPN(): void {
  // Create VPN config directory if it doesn't exist
  if (!existsSync(VPN_CONFIG_DIR)) {
    execSync(`mkdir -p "${VPN_CONFIG_DIR}"`);
  }

  // Create default config if it doesn't exist
  if (!existsSync(VPN_CONFIG_FILE)) {
    const defaultConfig: VPNConfig = {
      provider: '',
      server: '',
      username: '',
      password: '',
      protocol: 'udp',
      port: 1194,
      killSwitchEnabled: true,
      dnsLeakProtection: true
    };
    writeFileSync(VPN_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  }

  // Create kill switch script
  if (!existsSync(KILL_SWITCH_SCRIPT)) {
    const killSwitchScript = `#!/bin/bash
# Kill switch script
iptables -F
iptables -X
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT`;
    writeFileSync(KILL_SWITCH_SCRIPT, killSwitchScript);
    execSync(`chmod +x "${KILL_SWITCH_SCRIPT}"`);
  }
}

// Get current VPN configuration
export function getVPNConfig(): VPNConfig {
  return JSON.parse(readFileSync(VPN_CONFIG_FILE, 'utf-8'));
}

// Update VPN configuration
export function updateVPNConfig(newConfig: Partial<VPNConfig>): void {
  const currentConfig = getVPNConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  writeFileSync(VPN_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
}

// Connect to VPN
export function connectVPN(): boolean {
  try {
    const config = getVPNConfig();
    const command = `openvpn --config "${join(VPN_CONFIG_DIR, 'client.ovpn')}" ` +
      `--remote ${config.server} ${config.port} ${config.protocol} ` +
      `--auth-user-pass "${join(VPN_CONFIG_DIR, 'credentials.txt')}"`;
    
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Failed to connect to VPN:', error);
    return false;
  }
}

// Disconnect VPN
export function disconnectVPN(): boolean {
  try {
    execSync('pkill openvpn');
    return true;
  } catch (error) {
    console.error('Failed to disconnect VPN:', error);
    return false;
  }
}

// Enable kill switch
export function enableKillSwitch(): boolean {
  try {
    execSync(`sudo ${KILL_SWITCH_SCRIPT}`);
    return true;
  } catch (error) {
    console.error('Failed to enable kill switch:', error);
    return false;
  }
}

// Check VPN connection status
export function checkVPNStatus(): boolean {
  try {
    execSync('pgrep openvpn');
    return true;
  } catch (error) {
    return false;
  }
}
