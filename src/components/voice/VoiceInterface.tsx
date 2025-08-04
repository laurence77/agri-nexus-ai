import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Globe,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';

interface VoiceInterfaceProps {
  className?: string;
  onActivityRecorded?: (activity: any) => void;
  onDataRequested?: (dataType: string) => void;
}

interface VoiceSession {
  sessionId: string;
  language: string;
  isActive: boolean;
}

interface VoiceResponse {
  text: string;
  speech: string;
  language: string;
  actions?: Array<{
    type: 'record_activity' | 'show_data' | 'navigate' | 'request_clarification';
    data?: any;
  }>;
  followUpQuestion?: string;
}

/**
 * Voice Interface Component
 * Provides speech-to-text and text-to-speech capabilities for farmers
 */
export function VoiceInterface({ 
  className, 
  onActivityRecorded, 
  onDataRequested 
}: VoiceInterfaceProps) {
  const { user, tenantId } = useAuth();
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'system';
    text: string;
    timestamp: Date;
  }>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Supported languages
  const supportedLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'sw-KE', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    initializeVoiceServices();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (session && lastResponse?.speech && !isSpeaking) {
      speakText(lastResponse.speech);
    }
  }, [lastResponse, session]);

  const initializeVoiceServices = async () => {
    try {
      // Check for speech recognition support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.maxAlternatives = 1;
          
          recognitionRef.current.onresult = handleSpeechResult;
          recognitionRef.current.onerror = handleSpeechError;
          recognitionRef.current.onstart = () => setIsListening(true);
          recognitionRef.current.onend = () => setIsListening(false);
        }
      }

      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }

      // Check overall support
      const supported = !!(recognitionRef.current && synthRef.current);
      setIsSupported(supported);

      if (!supported) {
        setError('Voice features are not supported in this browser. Please use Chrome or Edge for the best experience.');
      }
    } catch (error) {
      console.error('Error initializing voice services:', error);
      setError('Failed to initialize voice services');
    }
  };

  const startVoiceSession = async () => {
    if (!user || !tenantId) {
      setError('Please sign in to use voice features');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/voice/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tenantId,
          language: selectedLanguage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start voice session');
      }

      setSession({
        sessionId: data.sessionId,
        language: data.language,
        isActive: true
      });

      // Add welcome message to conversation
      setConversation([{
        type: 'system',
        text: 'Voice assistant activated. How can I help you today?',
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error starting voice session:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice session');
    } finally {
      setIsProcessing(false);
    }
  };

  const endVoiceSession = async () => {
    if (!session) return;

    try {
      await fetch('/api/voice/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId })
      });

      setSession(null);
      setConversation([]);
      setLastResponse(null);
      setCurrentText('');
      
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error ending voice session:', error);
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current || !session || isListening) return;

    try {
      setError(null);
      recognitionRef.current.lang = session.language;
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start listening. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSpeechResult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    setCurrentText(finalTranscript || interimTranscript);

    if (finalTranscript) {
      processVoiceCommand(finalTranscript);
    }
  };

  const handleSpeechError = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    
    switch (event.error) {
      case 'no-speech':
        setError('No speech detected. Please try again.');
        break;
      case 'audio-capture':
        setError('Microphone access denied. Please allow microphone access.');
        break;
      case 'not-allowed':
        setError('Microphone access not permitted. Please enable microphone access.');
        break;
      default:
        setError(`Speech recognition error: ${event.error}`);
    }
  };

  const processVoiceCommand = async (text: string) => {
    if (!session || !text.trim()) return;

    try {
      setIsProcessing(true);
      setCurrentText('');

      // Add user message to conversation
      const userMessage = {
        type: 'user' as const,
        text,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);

      // Process command
      const response = await fetch('/api/voice/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          command: text
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process voice command');
      }

      const voiceResponse = data.response;
      setLastResponse(voiceResponse);

      // Add system response to conversation
      const systemMessage = {
        type: 'system' as const,
        text: voiceResponse.text,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, systemMessage]);

      // Handle actions
      if (voiceResponse.actions) {
        for (const action of voiceResponse.actions) {
          switch (action.type) {
            case 'record_activity':
              onActivityRecorded?.(action.data);
              break;
            case 'show_data':
              onDataRequested?.(action.data);
              break;
          }
        }
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      setError(error instanceof Error ? error.message : 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    if (!synthRef.current || !text) return;

    try {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = session?.language || selectedLanguage;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else if (lastResponse?.speech) {
      speakText(lastResponse.speech);
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <GlassCard className={cn('p-6 text-center', className)}>
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Voice Features Not Supported</h3>
        <p className="text-gray-300 text-sm">
          Voice features require a modern browser with microphone access. 
          Please use Chrome or Edge for the best experience.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className={cn('voice-interface space-y-6', className)}>
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              session ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            )}>
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Voice Assistant</h3>
              <p className="text-gray-400 text-sm">
                {session ? 'Voice session active' : 'Click start to begin'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={!!session}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-gray-800">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!session ? (
            <GlassButton
              variant="primary"
              size="lg"
              onClick={startVoiceSession}
              disabled={isProcessing || !user}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Activity className="h-5 w-5 mr-2" />
              )}
              Start Voice
            </GlassButton>
          ) : (
            <>
              <GlassButton
                variant={isListening ? "danger" : "primary"}
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className="relative"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Listening
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Listening
                  </>
                )}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                onClick={toggleSpeech}
                disabled={!lastResponse?.speech}
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5 mr-2" />
                ) : (
                  <Volume2 className="h-5 w-5 mr-2" />
                )}
                {isSpeaking ? 'Stop Speech' : 'Repeat'}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                onClick={endVoiceSession}
              >
                End Session
              </GlassButton>
            </>
          )}
        </div>

        {/* Current Text Display */}
        {currentText && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm font-medium">Listening...</p>
            <p className="text-white">{currentText}</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing your request...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Conversation</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-2 rounded-lg',
                    message.type === 'user'
                      ? 'bg-green-500/20 text-green-100'
                      : 'bg-blue-500/20 text-blue-100'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Quick Commands Help */}
      <GlassCard className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Voice Commands</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-green-400 font-medium mb-2">Recording Activities</h5>
            <ul className="text-gray-300 space-y-1">
              <li>• "I planted 5 kg of maize"</li>
              <li>• "Record harvesting 20 kg beans"</li>
              <li>• "I sprayed the tomato field"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-blue-400 font-medium mb-2">Information</h5>
            <ul className="text-gray-300 space-y-1">
              <li>• "What's the weather today?"</li>
              <li>• "Show me farm status"</li>
              <li>• "Market prices for maize"</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default VoiceInterface;