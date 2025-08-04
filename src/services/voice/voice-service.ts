/**
 * Voice Interface Service for Low-Literacy Farmers
 * Provides voice commands, speech-to-text, and text-to-speech functionality
 * Supports multiple African languages: English, Swahili, Hausa, Yoruba, French
 */

import { DatabaseService } from '@/lib/supabase';

export type VoiceLanguage = 'en-US' | 'sw-KE' | 'ha-NG' | 'yo-NG' | 'fr-FR';

export interface VoiceSession {
  sessionId: string;
  userId: string;
  tenantId: string;
  language: VoiceLanguage;
  currentContext: 'farm_status' | 'record_activity' | 'weather' | 'market_prices' | 'general';
  isListening: boolean;
  lastCommand: string;
  conversationHistory: VoiceInteraction[];
  startTime: Date;
  lastActivity: Date;
}

export interface VoiceInteraction {
  id: string;
  type: 'user_speech' | 'system_response';
  content: string;
  language: VoiceLanguage;
  timestamp: Date;
  confidence?: number;
  intent?: string;
  entities?: Record<string, any>;
}

export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  originalText: string;
  language: VoiceLanguage;
}

export interface VoiceResponse {
  text: string;
  speech: string;
  language: VoiceLanguage;
  actions?: Array<{
    type: 'record_activity' | 'show_data' | 'navigate' | 'request_clarification';
    data?: any;
  }>;
  followUpQuestion?: string;
}

// Multi-language voice prompts and responses
const VOICE_PROMPTS = {
  'en-US': {
    welcome: "Welcome to AgriNexus AI voice assistant. How can I help you today?",
    listening: "I'm listening. Please speak your command.",
    not_understood: "I didn't understand that. Could you please repeat?",
    activity_recorded: "Activity has been recorded successfully.",
    weather_intro: "Here's today's weather information:",
    farm_status_intro: "Here's your current farm status:",
    market_prices_intro: "Here are today's market prices:",
    ask_crop_type: "What crop are you working with?",
    ask_amount: "How much did you harvest or plant? Please specify the amount.",
    ask_field_name: "Which field is this for?",
    confirm_activity: "Let me confirm: You want to record {activity} of {amount} {unit} of {crop} in {field}. Is this correct?",
    goodbye: "Thank you for using AgriNexus AI. Have a great day!",
    error: "I'm sorry, there was an error processing your request. Please try again.",
    help: "You can ask me about farm status, record activities, check weather, or get market prices. What would you like to know?"
  },
  'sw-KE': {
    welcome: "Karibu kwa msaidizi wa sauti wa AgriNexus AI. Ninawezaje kukusaidia leo?",
    listening: "Nasikiliza. Tafadhali sema amri yako.",
    not_understood: "Sikuelewi hilo. Tafadhali rudia?",
    activity_recorded: "Shughuli imeandikwa kwa mafanikio.",
    weather_intro: "Haya ni maelezo ya hali ya hewa ya leo:",
    farm_status_intro: "Haya ni hali ya shamba lako kwa sasa:",
    market_prices_intro: "Hii ni bei za soko za leo:",
    ask_crop_type: "Unakilimo aina gani ya mazao?",
    ask_amount: "Umevuna au kupanda kiasi gani? Tafadhali bainisha kiasi.",
    ask_field_name: "Ni shamba lipi hili?",
    confirm_activity: "Hebu nithibitishe: Unataka kuandika {activity} ya {amount} {unit} ya {crop} katika {field}. Je hii ni sahihi?",
    goodbye: "Asante kwa kutumia AgriNexus AI. Uwe na siku njema!",
    error: "Samahani, kulikuwa na hitilafu wakati wa kushughulikia ombi lako. Tafadhali jaribu tena.",
    help: "Unaweza kuniuliza kuhusu hali ya shamba, kuandika shughuli, kuangalia hali ya hewa, au kupata bei za soko. Unataka kujua nini?"
  },
  'ha-NG': {
    welcome: "Maraba da mai taimako na murya na AgriNexus AI. Ta yaya zan iya taimaka maka yau?",
    listening: "Ina saurara. Don Allah fada umarninka.",
    not_understood: "Ban fahimci wannan ba. Don Allah ka sake faɗa?",
    activity_recorded: "An rubuta aikin da nasara.",
    weather_intro: "Ga bayanan yanayin yau:",
    farm_status_intro: "Ga yanayin gona ka na yanzu:",
    market_prices_intro: "Ga farashin kasuwa na yau:",
    ask_crop_type: "Wane irin amfani kake yi da shi?",
    ask_amount: "Nawa ka girba ko ka shuka? Don Allah ka faɗa adadin.",
    ask_field_name: "Wace gona ce wannan?",
    confirm_activity: "Bari in tabbatar: Kana son ka rubuta {activity} na {amount} {unit} na {crop} a {field}. Wannan daidai ne?",
    goodbye: "Na gode da amfani da AgriNexus AI. Ka sami rana mai kyau!",
    error: "Yi hakuri, akwai kuskure wajen aiwatar da bukatar ka. Don Allah ka sake gwadawa.",
    help: "Kana iya tambayar ni game da yanayin gona, rubuta ayyuka, duba yanayi, ko samun farashin kasuwa. Me kake son ka sani?"
  },
  'yo-NG': {
    welcome: "Kaabo si oluranlowo ohun ti AgriNexus AI. Bawo ni mo ṣe le ran ọ lọwọ loni?",
    listening: "Mo ngbọ. Jọwọ sọ aṣẹ rẹ.",
    not_understood: "Mi o ye mi. Ṣe o le tun sọ?",
    activity_recorded: "A ti kọ iṣẹ naa silẹ ni aṣeyọri.",
    weather_intro: "Eyi ni alaye oju ojo ti oni:",
    farm_status_intro: "Eyi ni ipo oko rẹ lọwọlọwọ:",
    market_prices_intro: "Wọnyi ni awọn idiyele oja ti oni:",
    ask_crop_type: "Iru oko wo ni o n ṣiṣẹ pẹlu?",
    ask_amount: "Melo ni o kore tabi o gbin? Jọwọ pato iye naa.",
    ask_field_name: "Oko wo ni eyi fun?",
    confirm_activity: "Jẹ ki n jẹrisi: O fẹ kọ {activity} ti {amount} {unit} ti {crop} sinu {field}. Ṣe eyi tọ?",
    goodbye: "O ṣeun fun lilo AgriNexus AI. O ni ọjọ to dara!",
    error: "Ma binu, aṣiṣe kan wa nigba sisẹ ibeere rẹ. Jọwọ gbiyanju lẹẹkansi.",
    help: "O le beere mi nipa ipo oko, kọ awọn iṣẹ, wo oju ojo, tabi gba awọn idiyele oja. Kini o fẹ mọ?"
  },
  'fr-FR': {
    welcome: "Bienvenue à l'assistant vocal AgriNexus AI. Comment puis-je vous aider aujourd'hui?",
    listening: "J'écoute. Veuillez dire votre commande.",
    not_understood: "Je n'ai pas compris. Pourriez-vous répéter s'il vous plaît?",
    activity_recorded: "L'activité a été enregistrée avec succès.",
    weather_intro: "Voici les informations météo d'aujourd'hui:",
    farm_status_intro: "Voici l'état actuel de votre ferme:",
    market_prices_intro: "Voici les prix du marché d'aujourd'hui:",
    ask_crop_type: "Avec quelle culture travaillez-vous?",
    ask_amount: "Combien avez-vous récolté ou planté? Veuillez spécifier la quantité.",
    ask_field_name: "Pour quel champ est-ce?",
    confirm_activity: "Permettez-moi de confirmer: Vous voulez enregistrer {activity} de {amount} {unit} de {crop} dans {field}. Est-ce correct?",
    goodbye: "Merci d'avoir utilisé AgriNexus AI. Passez une excellente journée!",
    error: "Désolé, il y a eu une erreur lors du traitement de votre demande. Veuillez réessayer.",
    help: "Vous pouvez me demander l'état de la ferme, enregistrer des activités, vérifier la météo ou obtenir les prix du marché. Que voulez-vous savoir?"
  }
};

// Voice command patterns for intent recognition
const COMMAND_PATTERNS = {
  'en-US': {
    record_activity: [
      /record.*(planting|planted|plant)/i,
      /record.*(harvest|harvested|harvesting)/i,
      /record.*(spray|sprayed|spraying)/i,
      /record.*(irrigation|irrigated|watering)/i,
      /(planted|harvested|sprayed|irrigated).*/i,
      /i (planted|harvested|sprayed|irrigated).*/i
    ],
    farm_status: [
      /farm status/i,
      /how.*(farm|crops|fields)/i,
      /status.*(farm|crops|fields)/i,
      /check.*(farm|crops|fields)/i
    ],
    weather: [
      /weather/i,
      /rain/i,
      /temperature/i,
      /forecast/i
    ],
    market_prices: [
      /market price/i,
      /price/i,
      /sell/i,
      /buy/i
    ]
  },
  'sw-KE': {
    record_activity: [
      /rekodi.*(kupanda|nimepanda|mbegu)/i,
      /rekodi.*(kuvuna|nimevuna|mavuno)/i,
      /rekodi.*(kunyunyiza|nimenyunyiza)/i,
      /rekodi.*(kumwagilia|nimemwagilia)/i,
      /(nimepanda|nimevuna|nimenyunyiza|nimemwagilia).*/i
    ],
    farm_status: [
      /hali ya shamba/i,
      /shamba/i,
      /mazao/i,
      /mashamba/i
    ],
    weather: [
      /hali ya hewa/i,
      /mvua/i,
      /joto/i,
      /utabiri/i
    ],
    market_prices: [
      /bei za soko/i,
      /bei/i,
      /kuuza/i,
      /kununua/i
    ]
  }
  // Add more language patterns as needed
};

export class VoiceService {
  private dbService: DatabaseService;
  private activeSessions: Map<string, VoiceSession> = new Map();
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.dbService = new DatabaseService();
    this.initializeSpeechServices();
  }

  private initializeSpeechServices(): void {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      
      // Configure speech recognition
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }

    console.log('Voice service initialized. Supported:', this.isSupported);
  }

  async startVoiceSession(userId: string, tenantId: string, language: VoiceLanguage = 'en-US'): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const session: VoiceSession = {
      sessionId,
      userId,
      tenantId,
      language,
      currentContext: 'general',
      isListening: false,
      lastCommand: '',
      conversationHistory: [],
      startTime: new Date(),
      lastActivity: new Date()
    };

    this.activeSessions.set(sessionId, session);
    
    // Welcome message
    const welcomeMessage = this.getPrompt('welcome', language);
    await this.speak(welcomeMessage, language);
    
    this.addToConversationHistory(session, 'system_response', welcomeMessage);
    
    return sessionId;
  }

  async processVoiceCommand(sessionId: string, audioBlob?: Blob): Promise<VoiceResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session ID');
    }

    try {
      let spokenText: string;
      
      if (audioBlob) {
        // Convert audio to text using speech recognition
        spokenText = await this.speechToText(audioBlob, session.language);
      } else {
        // Start continuous listening
        spokenText = await this.startListening(session);
      }

      if (!spokenText) {
        return this.createErrorResponse(session, 'not_understood');
      }

      // Add user speech to conversation history
      this.addToConversationHistory(session, 'user_speech', spokenText);
      
      // Parse the voice command
      const command = this.parseVoiceCommand(spokenText, session.language);
      
      // Process the command based on intent
      const response = await this.handleVoiceCommand(session, command);
      
      // Add system response to conversation history
      this.addToConversationHistory(session, 'system_response', response.text);
      
      // Update session
      session.lastCommand = spokenText;
      session.lastActivity = new Date();
      
      return response;
    } catch (error) {
      console.error('Voice command processing error:', error);
      return this.createErrorResponse(session, 'error');
    }
  }

  private async speechToText(audioBlob: Blob, language: VoiceLanguage): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Convert language code for speech recognition
      const recognitionLanguage = this.convertLanguageCode(language);
      this.recognition.lang = recognitionLanguage;

      this.recognition.onresult = (event) => {
        const result = event.results[0][0];
        resolve(result.transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      // Start recognition with audio blob
      // Note: Web Speech API doesn't directly support blob input
      // In production, you'd need to use a more sophisticated service
      this.recognition.start();
    });
  }

  private async startListening(session: VoiceSession): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      session.isListening = true;
      const recognitionLanguage = this.convertLanguageCode(session.language);
      this.recognition.lang = recognitionLanguage;

      // Announce that we're listening
      this.speak(this.getPrompt('listening', session.language), session.language);

      this.recognition.onresult = (event) => {
        const result = event.results[0][0];
        session.isListening = false;
        resolve(result.transcript);
      };

      this.recognition.onerror = (event) => {
        session.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        session.isListening = false;
      };

      this.recognition.start();
    });
  }

  private async speak(text: string, language: VoiceLanguage): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.convertLanguageCode(language);
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Still resolve on error

      this.synthesis.speak(utterance);
    });
  }

  private parseVoiceCommand(text: string, language: VoiceLanguage): VoiceCommand {
    const normalizedText = text.toLowerCase().trim();
    
    // Extract intent based on patterns
    let intent = 'unknown';
    let confidence = 0;
    const entities: Record<string, any> = {};

    const patterns = COMMAND_PATTERNS[language] || COMMAND_PATTERNS['en-US'];
    
    // Check for different intents
    for (const [intentName, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        if (pattern.test(normalizedText)) {
          intent = intentName;
          confidence = 0.8; // Basic confidence scoring
          break;
        }
      }
      if (intent !== 'unknown') break;
    }

    // Extract entities (crop types, amounts, field names, etc.)
    this.extractEntities(normalizedText, entities, language);

    return {
      intent,
      entities,
      confidence,
      originalText: text,
      language
    };
  }

  private extractEntities(text: string, entities: Record<string, any>, language: VoiceLanguage): void {
    // Extract numbers (amounts)
    const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      entities.amount = parseFloat(numberMatch[1]);
    }

    // Extract crop types based on language
    const cropPatterns = {
      'en-US': {
        maize: /\b(maize|corn)\b/i,
        beans: /\b(beans|bean)\b/i,
        tomatoes: /\b(tomatoes|tomato)\b/i,
        onions: /\b(onions|onion)\b/i,
        potatoes: /\b(potatoes|potato)\b/i
      },
      'sw-KE': {
        mahindi: /\b(mahindi|nafaka)\b/i,
        maharage: /\b(maharage|maharagwe)\b/i,
        nyanya: /\b(nyanya)\b/i,
        vitunguu: /\b(vitunguu|kitunguu)\b/i,
        viazi: /\b(viazi)\b/i
      }
    };

    const crops = cropPatterns[language] || cropPatterns['en-US'];
    for (const [crop, pattern] of Object.entries(crops)) {
      if (pattern.test(text)) {
        entities.crop = crop;
        break;
      }
    }

    // Extract activity types
    const activityPatterns = {
      'en-US': {
        planting: /\b(plant|planted|planting|sow|sowed|sowing)\b/i,
        harvesting: /\b(harvest|harvested|harvesting|pick|picked|picking)\b/i,
        spraying: /\b(spray|sprayed|spraying|pesticide|herbicide)\b/i,
        irrigation: /\b(water|watered|watering|irrigate|irrigated|irrigation)\b/i
      },
      'sw-KE': {
        kupanda: /\b(panda|pandwa|kupanda|mbegu)\b/i,
        kuvuna: /\b(vuna|vunwa|kuvuna|mavuno)\b/i,
        kunyunyiza: /\b(nyunyiza|nyunyizwa|kunyunyiza)\b/i,
        kumwagilia: /\b(mwagilia|mwagiliwa|kumwagilia|maji)\b/i
      }
    };

    const activities = activityPatterns[language] || activityPatterns['en-US'];
    for (const [activity, pattern] of Object.entries(activities)) {
      if (pattern.test(text)) {
        entities.activity = activity;
        break;
      }
    }

    // Extract field references
    const fieldPattern = /\b(field|farm|plot|shamba|gona|oko)\s*(\w+|\d+)\b/i;
    const fieldMatch = text.match(fieldPattern);
    if (fieldMatch) {
      entities.field = fieldMatch[2] || 'main';
    }
  }

  private async handleVoiceCommand(session: VoiceSession, command: VoiceCommand): Promise<VoiceResponse> {
    switch (command.intent) {
      case 'record_activity':
        return this.handleRecordActivity(session, command);
      
      case 'farm_status':
        return this.handleFarmStatus(session, command);
      
      case 'weather':
        return this.handleWeather(session, command);
      
      case 'market_prices':
        return this.handleMarketPrices(session, command);
      
      default:
        return this.handleUnknownCommand(session, command);
    }
  }

  private async handleRecordActivity(session: VoiceSession, command: VoiceCommand): Promise<VoiceResponse> {
    const { entities } = command;
    
    // Check if we have all required information
    const missingInfo = [];
    if (!entities.activity) missingInfo.push('activity');
    if (!entities.crop) missingInfo.push('crop');
    if (!entities.amount) missingInfo.push('amount');

    if (missingInfo.length > 0) {
      // Ask for missing information
      const question = this.getPrompt(`ask_${missingInfo[0]}`, session.language);
      session.currentContext = 'record_activity';
      
      return {
        text: question,
        speech: question,
        language: session.language,
        followUpQuestion: question
      };
    }

    // Record the activity
    try {
      await this.dbService.insert('activities', {
        tenant_id: session.tenantId,
        worker_id: session.userId,
        activity_type: entities.activity,
        description: `Voice recorded ${entities.activity} of ${entities.crop}`,
        scheduled_date: new Date().toISOString(),
        status: 'completed',
        metadata: {
          amount: entities.amount,
          crop: entities.crop,
          field: entities.field || 'main',
          source: 'voice',
          confidence: command.confidence,
          original_text: command.originalText
        }
      });

      const successMessage = this.getPrompt('activity_recorded', session.language);
      return {
        text: successMessage,
        speech: successMessage,
        language: session.language,
        actions: [{
          type: 'record_activity',
          data: entities
        }]
      };
    } catch (error) {
      console.error('Error recording activity:', error);
      return this.createErrorResponse(session, 'error');
    }
  }

  private async handleFarmStatus(session: VoiceSession, command: VoiceCommand): Promise<VoiceResponse> {
    try {
      // Get farm data
      const fields = await this.dbService.query('fields', { 
        tenant_id: session.tenantId 
      });
      
      let statusText = this.getPrompt('farm_status_intro', session.language) + '\n';
      
      fields.forEach((field: any, index: number) => {
        const status = field.field_status || 'unknown';
        statusText += `${field.field_name}: ${status}\n`;
      });

      return {
        text: statusText,
        speech: statusText,
        language: session.language,
        actions: [{
          type: 'show_data',
          data: { fields }
        }]
      };
    } catch (error) {
      console.error('Error getting farm status:', error);
      return this.createErrorResponse(session, 'error');
    }
  }

  private handleWeather(session: VoiceSession, command: VoiceCommand): VoiceResponse {
    // Mock weather data - integrate with weather API in production
    const weatherText = this.getPrompt('weather_intro', session.language) + 
                       '\nTemperature: 28°C\nHumidity: 65%\nCondition: Partly Cloudy';

    return {
      text: weatherText,
      speech: weatherText,
      language: session.language,
      actions: [{
        type: 'show_data',
        data: { weather: { temp: 28, humidity: 65, condition: 'Partly Cloudy' } }
      }]
    };
  }

  private handleMarketPrices(session: VoiceSession, command: VoiceCommand): VoiceResponse {
    // Mock market prices - integrate with market data API in production
    const pricesText = this.getPrompt('market_prices_intro', session.language) +
                      '\nMaize: $45/kg\nBeans: $85/kg\nTomatoes: $60/kg';

    return {
      text: pricesText,
      speech: pricesText,
      language: session.language,
      actions: [{
        type: 'show_data',
        data: { 
          prices: [
            { crop: 'Maize', price: 45, unit: 'kg' },
            { crop: 'Beans', price: 85, unit: 'kg' },
            { crop: 'Tomatoes', price: 60, unit: 'kg' }
          ]
        }
      }]
    };
  }

  private handleUnknownCommand(session: VoiceSession, command: VoiceCommand): VoiceResponse {
    const helpMessage = this.getPrompt('help', session.language);
    
    return {
      text: helpMessage,
      speech: helpMessage,
      language: session.language,
      followUpQuestion: helpMessage
    };
  }

  private createErrorResponse(session: VoiceSession, errorType: string): VoiceResponse {
    const errorMessage = this.getPrompt(errorType, session.language);
    
    return {
      text: errorMessage,
      speech: errorMessage,
      language: session.language
    };
  }

  // Utility methods
  private getPrompt(key: string, language: VoiceLanguage): string {
    return VOICE_PROMPTS[language]?.[key as keyof typeof VOICE_PROMPTS['en-US']] || 
           VOICE_PROMPTS['en-US'][key as keyof typeof VOICE_PROMPTS['en-US']] || 
           'Prompt not found';
  }

  private convertLanguageCode(language: VoiceLanguage): string {
    const mapping: Record<VoiceLanguage, string> = {
      'en-US': 'en-US',
      'sw-KE': 'sw-KE',
      'ha-NG': 'ha-NG', 
      'yo-NG': 'yo-NG',
      'fr-FR': 'fr-FR'
    };
    return mapping[language] || 'en-US';
  }

  private addToConversationHistory(
    session: VoiceSession, 
    type: 'user_speech' | 'system_response', 
    content: string,
    confidence?: number
  ): void {
    const interaction: VoiceInteraction = {
      id: this.generateInteractionId(),
      type,
      content,
      language: session.language,
      timestamp: new Date(),
      confidence
    };

    session.conversationHistory.push(interaction);
    
    // Keep only last 20 interactions to manage memory
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }
  }

  private generateSessionId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  async endVoiceSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const goodbyeMessage = this.getPrompt('goodbye', session.language);
      await this.speak(goodbyeMessage, session.language);
      this.activeSessions.delete(sessionId);
    }
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  isVoiceSupported(): boolean {
    return this.isSupported;
  }
}

export default VoiceService;