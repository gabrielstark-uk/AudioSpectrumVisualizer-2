import { shutdownFrequency, neutralizeInitiatorDevice, handleHarmfulFrequency } from "../utils/frequencyShutdown";
import { DetectionResult } from "../utils/frequencyAnalysis";

// Mock the AudioContext and its methods
const mockOscillator = {
  frequency: { setValueAtTime: jest.fn() },
  start: jest.fn(),
  stop: jest.fn(),
  connect: jest.fn()
};

const mockGainNode = {
  gain: { setValueAtTime: jest.fn() },
  connect: jest.fn()
};

const mockAudioContext = {
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  close: jest.fn(),
  currentTime: 0,
  destination: {}
};

// Mock setTimeout
jest.useFakeTimers();

describe("Frequency Shutdown", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup global AudioContext mock
    global.AudioContext = jest.fn(() => mockAudioContext);

    // Mock console.log
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original setTimeout
    jest.useRealTimers();
  });

  it("should shut down a frequency with correct parameters", () => {
    // Test parameters
    const frequency = 1000;
    const amplitude = 0.5;
    const duration = 1000;

    // Call the function
    shutdownFrequency(frequency, amplitude, duration);

    // Verify AudioContext was created
    expect(AudioContext).toHaveBeenCalled();

    // Verify oscillator was configured correctly
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(frequency, 0);

    // Verify gain node was configured with negative amplitude (inverse wave)
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(-amplitude * 1.0, 0);

    // Verify connections were made
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);

    // Verify oscillator was started
    expect(mockOscillator.start).toHaveBeenCalled();

    // Fast-forward time to trigger the setTimeout callback
    jest.advanceTimersByTime(duration);

    // Verify oscillator was stopped and context was closed
    expect(mockOscillator.stop).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it("should neutralize initiator device when confidence is high", () => {
    // Create a detection result with high confidence
    const detectionResult: DetectionResult = {
      detected: true,
      confidence: 0.95, // Above the threshold of 0.9
      frequency: 2100,
      signalStrength: 0.8,
      pattern: 'modulated'
    };

    // Call the function
    neutralizeInitiatorDevice(detectionResult);

    // Verify console.log was called with the correct message
    expect(console.log).toHaveBeenCalledWith(
      `Neutralizing initiator device at frequency ${detectionResult.frequency}Hz`
    );
  });

  it("should not neutralize initiator device when confidence is low", () => {
    // Create a detection result with low confidence
    const detectionResult: DetectionResult = {
      detected: true,
      confidence: 0.85, // Below the threshold of 0.9
      frequency: 2100,
      signalStrength: 0.8,
      pattern: 'modulated'
    };

    // Call the function
    neutralizeInitiatorDevice(detectionResult);

    // Verify console.log was not called
    expect(console.log).not.toHaveBeenCalled();
  });

  it("should handle harmful frequency detection with correct parameters", () => {
    // Create a detection result
    const detectionResult: DetectionResult = {
      detected: true,
      confidence: 0.9,
      frequency: 150,
      signalStrength: 0.7,
      pattern: 'pulsed'
    };

    // Spy on the functions that should be called
    const shutdownSpy = jest.spyOn(require("../utils/frequencyShutdown"), 'shutdownFrequency');
    const neutralizeSpy = jest.spyOn(require("../utils/frequencyShutdown"), 'neutralizeInitiatorDevice');

    // Call the function
    handleHarmfulFrequency(detectionResult);

    // Verify shutdownFrequency was called with the correct parameters
    expect(shutdownSpy).toHaveBeenCalledWith(
      detectionResult.frequency,
      detectionResult.signalStrength,
      5000 // NEUTRALIZATION_DURATION constant from the implementation
    );

    // Verify neutralizeInitiatorDevice was called with the detection result
    expect(neutralizeSpy).toHaveBeenCalledWith(detectionResult);
  });

  it("should not process when detection is false", () => {
    // Create a detection result with detected = false
    const detectionResult: DetectionResult = {
      detected: false,
      confidence: 0.9,
      frequency: 150,
      signalStrength: 0.7,
      pattern: 'pulsed'
    };

    // Spy on the functions that should be called
    const shutdownSpy = jest.spyOn(require("../utils/frequencyShutdown"), 'shutdownFrequency');
    const neutralizeSpy = jest.spyOn(require("../utils/frequencyShutdown"), 'neutralizeInitiatorDevice');

    // Call the function
    handleHarmfulFrequency(detectionResult);

    // Verify neither function was called
    expect(shutdownSpy).not.toHaveBeenCalled();
    expect(neutralizeSpy).not.toHaveBeenCalled();
  });
});
