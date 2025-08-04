/**
 * USSD Service for Low-Literacy Farmers
 * Provides agricultural services via USSD interface with multi-language support
 * Supports Swahili, Hausa, Yoruba, French, and English
 */

import { DatabaseService } from '@/lib/supabase';

export type USSDLanguage = 'en' | 'sw' | 'ha' | 'yo' | 'fr';

export interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  language: USSDLanguage;
  currentMenu: string;
  menuStack: string[];
  userData: any;
  tenantId?: string;
  userId?: string;
  step: number;
  lastActivity: Date;
}

export interface USSDResponse {
  message: string;
  continueSession: boolean;
  sessionData?: Partial<USSDSession>;
}

export interface USSDRequest {
  sessionId: string;
  phoneNumber: string;
  text: string;
  serviceCode: string;
}

// Multi-language menu texts
const MENU_TEXTS = {
  en: {
    welcome: "Welcome to AgriNexus AI\n1. Farm Status\n2. Weather\n3. Market Prices\n4. Expert Advice\n5. Record Activity\n6. Language\n0. Exit",
    farm_status: "Farm Status\n1. Crop Health\n2. Field Activities\n3. Harvest Records\n4. Equipment Status\n0. Back",
    weather: "Weather Information\n1. Today's Weather\n2. 3-Day Forecast\n3. Rainfall Alert\n4. Planting Advice\n0. Back",
    market_prices: "Market Prices\n1. Maize\n2. Beans\n3. Tomatoes\n4. Onions\n5. Other Crops\n0. Back",
    expert_advice: "Expert Advice\n1. Crop Diseases\n2. Pest Control\n3. Fertilizer Guide\n4. Talk to Expert\n0. Back",
    record_activity: "Record Activity\n1. Planting\n2. Harvesting\n3. Spraying\n4. Irrigation\n5. Other\n0. Back",
    language_menu: "Select Language\n1. English\n2. Kiswahili\n3. Hausa\n4. Yoruba\n5. Français\n0. Back",
    invalid_option: "Invalid option. Please try again.",
    session_timeout: "Session expired. Please try again.",
    thank_you: "Thank you for using AgriNexus AI!",
    coming_soon: "This feature is coming soon!",
    enter_amount: "Enter amount (kg):",
    enter_crop_type: "Enter crop type:",
    activity_recorded: "Activity recorded successfully!",
    error_occurred: "An error occurred. Please try again later."
  },
  sw: {
    welcome: "Karibu AgriNexus AI\n1. Hali ya Shamba\n2. Hali ya Hewa\n3. Bei za Soko\n4. Ushauri wa Mtaalamu\n5. Rekodi Shughuli\n6. Lugha\n0. Toka",
    farm_status: "Hali ya Shamba\n1. Afya ya Mazao\n2. Shughuli za Shambani\n3. Rekodi za Mavuno\n4. Hali ya Vifaa\n0. Rudi",
    weather: "Habari za Hali ya Hewa\n1. Hali ya Leo\n2. Utabiri wa Siku 3\n3. Tahadhari ya Mvua\n4. Ushauri wa Kupanda\n0. Rudi",
    market_prices: "Bei za Soko\n1. Mahindi\n2. Maharage\n3. Nyanya\n4. Vitunguu\n5. Mazao Mengine\n0. Rudi",
    expert_advice: "Ushauri wa Mtaalamu\n1. Magonjwa ya Mazao\n2. Udhibiti wa Wadudu\n3. Mwongozo wa Mbolea\n4. Ongea na Mtaalamu\n0. Rudi",
    record_activity: "Rekodi Shughuli\n1. Kupanda\n2. Kuvuna\n3. Kunyunyiza\n4. Kumwagilia\n5. Nyingine\n0. Rudi",
    language_menu: "Chagua Lugha\n1. English\n2. Kiswahili\n3. Hausa\n4. Yoruba\n5. Français\n0. Rudi",
    invalid_option: "Chaguo si sahihi. Jaribu tena.",
    session_timeout: "Muda umeisha. Jaribu tena.",
    thank_you: "Asante kwa kutumia AgriNexus AI!",
    coming_soon: "Kipengele hiki kinakuja hivi karibuni!",
    enter_amount: "Ingiza kiasi (kg):",
    enter_crop_type: "Ingiza aina ya mazao:",
    activity_recorded: "Shughuli imeandikwa kwa mafanikio!",
    error_occurred: "Hitilafu imetokea. Jaribu tena baadaye."
  },
  ha: {
    welcome: "Maraba da AgriNexus AI\n1. Yanayin Gona\n2. Yanayin Yanayi\n3. Farashin Kasuwa\n4. Shawarar Masani\n5. Rubuta Aiki\n6. Harshe\n0. Fita",
    farm_status: "Yanayin Gona\n1. Lafiyar Amfani\n2. Ayyukan Gona\n3. Bayanan Girbi\n4. Yanayin Kayan Aiki\n0. Koma",
    weather: "Bayanan Yanayi\n1. Yanayin Yau\n2. Hasashen Kwana 3\n3. Faɗakarwar Ruwan Sama\n4. Shawarar Shuki\n0. Koma",
    market_prices: "Farashin Kasuwa\n1. Masara\n2. Wake\n3. Tumatir\n4. Albasa\n5. Sauran Amfani\n0. Koma",
    expert_advice: "Shawarar Masani\n1. Cututtukan Amfani\n2. Yaki da Kwari\n3. Jagoran Taki\n4. Yi Magana da Masani\n0. Koma",
    record_activity: "Rubuta Aiki\n1. Shuki\n2. Girbi\n3. Feshi\n4. Ban Ruwa\n5. Wani\n0. Koma",
    language_menu: "Zaɓi Harshe\n1. English\n2. Kiswahili\n3. Hausa\n4. Yoruba\n5. Français\n0. Koma",
    invalid_option: "Zabin ba daidai ba. Ka sake gwadawa.",
    session_timeout: "Lokaci ya ƙare. Ka sake gwadawa.",
    thank_you: "Na gode da amfani da AgriNexus AI!",
    coming_soon: "Wannan fasali yana zuwa nan ba da jimawa ba!",
    enter_amount: "Shigar da adadi (kg):",
    enter_crop_type: "Shigar da nau'in amfani:",
    activity_recorded: "An rubuta aikin da nasara!",
    error_occurred: "Kuskure ya faru. Ka sake gwadawa daga baya."
  },
  yo: {
    welcome: "Kaabo si AgriNexus AI\n1. Ipo Oko\n2. Oju Ojo\n3. Owo Oja\n4. Imoran Amosye\n5. Kowe Ise\n6. Ede\n0. Jade",
    farm_status: "Ipo Oko\n1. Ilera Ogbin\n2. Ise Oko\n3. Akosile Ikore\n4. Ipo Ohun Elo\n0. Pada",
    weather: "Iroyin Oju Ojo\n1. Oju Ojo Oni\n2. Asotele Ojo Meta\n3. Ikilo Ojo\n4. Imoran Gbingbin\n0. Pada",
    market_prices: "Owo Oja\n1. Agbado\n2. Ewa\n3. Tomati\n4. Alubosa\n5. Awon Ogbin Miran\n0. Pada",
    expert_advice: "Imoran Amosye\n1. Aisan Ogbin\n2. Isakoso Kokoro\n3. Itosona Ajile\n4. Ba Amosye Soro\n0. Pada",
    record_activity: "Kowe Ise\n1. Gbingbin\n2. Ikore\n3. Fifun\n4. Bomirin\n5. Miran\n0. Pada",
    language_menu: "Yan Ede\n1. English\n2. Kiswahili\n3. Hausa\n4. Yoruba\n5. Français\n0. Pada",
    invalid_option: "Ayanfe ko tọ. Gbiyanju lẹẹkan si.",
    session_timeout: "Akoko ti pari. Gbiyanju lẹẹkan si.",
    thank_you: "O ṣeun fun lilo AgriNexus AI!",
    coming_soon: "Ẹya yii nbo laipẹ!",
    enter_amount: "Tẹ iye sinu (kg):",
    enter_crop_type: "Tẹ iru ogbin:",
    activity_recorded: "Ise ti wa ni kikọ silẹ ni ifijišẹ!",
    error_occurred: "Aṣiṣe kan waye. Gbiyanju lẹẹkansi lẹhin."
  },
  fr: {
    welcome: "Bienvenue à AgriNexus AI\n1. État de la Ferme\n2. Météo\n3. Prix du Marché\n4. Conseils d'Expert\n5. Enregistrer Activité\n6. Langue\n0. Quitter",
    farm_status: "État de la Ferme\n1. Santé des Cultures\n2. Activités des Champs\n3. Registres de Récolte\n4. État de l'Équipement\n0. Retour",
    weather: "Information Météo\n1. Météo d'Aujourd'hui\n2. Prévision 3 Jours\n3. Alerte Pluie\n4. Conseil de Plantation\n0. Retour",
    market_prices: "Prix du Marché\n1. Maïs\n2. Haricots\n3. Tomates\n4. Oignons\n5. Autres Cultures\n0. Retour",
    expert_advice: "Conseils d'Expert\n1. Maladies des Cultures\n2. Contrôle des Ravageurs\n3. Guide Fertilisant\n4. Parler à Expert\n0. Retour",
    record_activity: "Enregistrer Activité\n1. Plantation\n2. Récolte\n3. Pulvérisation\n4. Irrigation\n5. Autre\n0. Retour",
    language_menu: "Sélectionner Langue\n1. English\n2. Kiswahili\n3. Hausa\n4. Yoruba\n5. Français\n0. Retour",
    invalid_option: "Option invalide. Veuillez réessayer.",
    session_timeout: "Session expirée. Veuillez réessayer.",
    thank_you: "Merci d'utiliser AgriNexus AI!",
    coming_soon: "Cette fonctionnalité arrive bientôt!",
    enter_amount: "Entrez la quantité (kg):",
    enter_crop_type: "Entrez le type de culture:",
    activity_recorded: "Activité enregistrée avec succès!",
    error_occurred: "Une erreur s'est produite. Veuillez réessayer plus tard."
  }
};

export class USSDService {
  private sessions: Map<string, USSDSession> = new Map();
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  async handleUSSDRequest(request: USSDRequest): Promise<USSDResponse> {
    try {
      let session = this.getSession(request.sessionId);
      
      if (!session) {
        session = await this.createSession(request);
      } else {
        session.lastActivity = new Date();
      }

      // Process the user input
      const response = await this.processUserInput(session, request.text);
      
      // Update session
      this.sessions.set(request.sessionId, session);
      
      return response;
    } catch (error) {
      console.error('USSD processing error:', error);
      return {
        message: this.getText('error_occurred', 'en'),
        continueSession: false
      };
    }
  }

  private async createSession(request: USSDRequest): Promise<USSDSession> {
    // Detect user's preferred language based on phone number or previous records
    const language = await this.detectUserLanguage(request.phoneNumber);
    
    // Try to find existing user
    const user = await this.findUserByPhoneNumber(request.phoneNumber);
    
    const session: USSDSession = {
      sessionId: request.sessionId,
      phoneNumber: request.phoneNumber,
      language,
      currentMenu: 'main',
      menuStack: [],
      userData: user || {},
      tenantId: user?.tenant_id,
      userId: user?.id,
      step: 0,
      lastActivity: new Date()
    };

    return session;
  }

  private async processUserInput(session: USSDSession, input: string): Promise<USSDResponse> {
    const trimmedInput = input.trim();
    
    // Handle language selection first
    if (session.currentMenu === 'language') {
      return this.handleLanguageSelection(session, trimmedInput);
    }

    // Handle main menu
    if (session.currentMenu === 'main') {
      return this.handleMainMenu(session, trimmedInput);
    }

    // Handle sub-menus
    switch (session.currentMenu) {
      case 'farm_status':
        return this.handleFarmStatusMenu(session, trimmedInput);
      case 'weather':
        return this.handleWeatherMenu(session, trimmedInput);
      case 'market_prices':
        return this.handleMarketPricesMenu(session, trimmedInput);
      case 'expert_advice':
        return this.handleExpertAdviceMenu(session, trimmedInput);
      case 'record_activity':
        return this.handleRecordActivityMenu(session, trimmedInput);
      case 'crop_health':
        return this.handleCropHealthMenu(session, trimmedInput);
      case 'today_weather':
        return this.handleTodayWeather(session, trimmedInput);
      case 'market_crop_selection':
        return this.handleMarketCropSelection(session, trimmedInput);
      case 'activity_type_selection':
        return this.handleActivityTypeSelection(session, trimmedInput);
      case 'activity_amount_input':
        return this.handleActivityAmountInput(session, trimmedInput);
      default:
        return this.handleInvalidOption(session);
    }
  }

  private handleMainMenu(session: USSDSession, input: string): USSDResponse {
    switch (input) {
      case '1':
        session.currentMenu = 'farm_status';
        session.menuStack.push('main');
        return {
          message: this.getText('farm_status', session.language),
          continueSession: true
        };
      
      case '2':
        session.currentMenu = 'weather';
        session.menuStack.push('main');
        return {
          message: this.getText('weather', session.language),
          continueSession: true
        };
      
      case '3':
        session.currentMenu = 'market_prices';
        session.menuStack.push('main');
        return {
          message: this.getText('market_prices', session.language),
          continueSession: true
        };
      
      case '4':
        session.currentMenu = 'expert_advice';
        session.menuStack.push('main');
        return {
          message: this.getText('expert_advice', session.language),
          continueSession: true
        };
      
      case '5':
        session.currentMenu = 'record_activity';
        session.menuStack.push('main');
        return {
          message: this.getText('record_activity', session.language),
          continueSession: true
        };
      
      case '6':
        session.currentMenu = 'language';
        session.menuStack.push('main');
        return {
          message: this.getText('language_menu', session.language),
          continueSession: true
        };
      
      case '0':
        return {
          message: this.getText('thank_you', session.language),
          continueSession: false
        };
      
      default:
        return this.handleInvalidOption(session);
    }
  }

  private handleLanguageSelection(session: USSDSession, input: string): USSDResponse {
    const languageMap: Record<string, USSDLanguage> = {
      '1': 'en',
      '2': 'sw', 
      '3': 'ha',
      '4': 'yo',
      '5': 'fr'
    };

    if (input === '0') {
      return this.goBack(session);
    }

    const newLanguage = languageMap[input];
    if (newLanguage) {
      session.language = newLanguage;
      // Save language preference
      this.saveUserLanguagePreference(session.phoneNumber, newLanguage);
      
      session.currentMenu = 'main';
      session.menuStack = [];
      return {
        message: this.getText('welcome', session.language),
        continueSession: true
      };
    }

    return this.handleInvalidOption(session);
  }

  private handleFarmStatusMenu(session: USSDSession, input: string): USSDResponse {
    switch (input) {
      case '1':
        session.currentMenu = 'crop_health';
        session.menuStack.push('farm_status');
        return this.getCropHealthStatus(session);
      
      case '2':
        return this.getFieldActivities(session);
      
      case '3':
        return this.getHarvestRecords(session);
      
      case '4':
        return this.getEquipmentStatus(session);
      
      case '0':
        return this.goBack(session);
      
      default:
        return this.handleInvalidOption(session);
    }
  }

  private handleWeatherMenu(session: USSDSession, input: string): USSDResponse {
    switch (input) {
      case '1':
        session.currentMenu = 'today_weather';
        return this.getTodayWeather(session);
      
      case '2':
        return this.getWeatherForecast(session);
      
      case '3':
        return this.getRainfallAlert(session);
      
      case '4':
        return this.getPlantingAdvice(session);
      
      case '0':
        return this.goBack(session);
      
      default:
        return this.handleInvalidOption(session);
    }
  }

  private handleRecordActivityMenu(session: USSDSession, input: string): USSDResponse {
    const activityTypes = {
      '1': 'planting',
      '2': 'harvesting', 
      '3': 'spraying',
      '4': 'irrigation',
      '5': 'other'
    };

    if (input === '0') {
      return this.goBack(session);
    }

    const activityType = activityTypes[input as keyof typeof activityTypes];
    if (activityType) {
      session.userData.activityType = activityType;
      session.currentMenu = 'activity_amount_input';
      session.menuStack.push('record_activity');
      
      return {
        message: this.getText('enter_amount', session.language),
        continueSession: true
      };
    }

    return this.handleInvalidOption(session);
  }

  private handleActivityAmountInput(session: USSDSession, input: string): USSDResponse {
    const amount = parseFloat(input);
    
    if (isNaN(amount) || amount <= 0) {
      return {
        message: this.getText('invalid_option', session.language),
        continueSession: true
      };
    }

    // Record the activity
    this.recordFarmActivity(session, amount);
    
    session.currentMenu = 'main';
    session.menuStack = [];
    
    return {
      message: this.getText('activity_recorded', session.language) + '\n\n' + 
               this.getText('welcome', session.language),
      continueSession: true
    };
  }

  // Service methods
  private async getCropHealthStatus(session: USSDSession): Promise<USSDResponse> {
    if (!session.tenantId) {
      return {
        message: this.getText('coming_soon', session.language),
        continueSession: true
      };
    }

    try {
      const fields = await this.dbService.query('fields', { 
        tenant_id: session.tenantId 
      });

      let healthMessage = '';
      fields.forEach((field: any, index: number) => {
        const status = field.field_status || 'unknown';
        healthMessage += `${index + 1}. ${field.field_name}: ${status}\n`;
      });

      return {
        message: healthMessage + '\n0. ' + this.getText('invalid_option', session.language).split('.')[1],
        continueSession: true
      };
    } catch (error) {
      return {
        message: this.getText('error_occurred', session.language),
        continueSession: true
      };
    }
  }

  private getTodayWeather(session: USSDSession): USSDResponse {
    // Mock weather data - in production, integrate with weather API
    const weatherData = {
      en: `Today's Weather:\nTemp: 28°C\nHumidity: 65%\nCondition: Partly Cloudy\nWind: 12 km/h\n\n0. Back`,
      sw: `Hali ya Hewa Leo:\nJoto: 28°C\nUnyevu: 65%\nHali: Mawingu Kidogo\nUpepo: 12 km/h\n\n0. Rudi`,
      ha: `Yanayin Yau:\nZafi: 28°C\nDanshi: 65%\nYanayi: Gizagizai Kadan\nIska: 12 km/h\n\n0. Koma`,
      yo: `Oju Ojo Oni:\nOtutu: 28°C\nOmi: 65%\nIpo: Awọsanma Kekere\nAfefe: 12 km/h\n\n0. Pada`,
      fr: `Météo d'Aujourd'hui:\nTemp: 28°C\nHumidité: 65%\nCondition: Partiellement Nuageux\nVent: 12 km/h\n\n0. Retour`
    };

    return {
      message: weatherData[session.language],
      continueSession: true
    };
  }

  private async recordFarmActivity(session: USSDSession, amount: number): Promise<void> {
    if (!session.tenantId || !session.userId) {
      return;
    }

    try {
      await this.dbService.insert('activities', {
        tenant_id: session.tenantId,
        worker_id: session.userId,
        activity_type: session.userData.activityType,
        description: `USSD recorded ${session.userData.activityType}`,
        scheduled_date: new Date().toISOString(),
        status: 'completed',
        metadata: {
          amount,
          source: 'ussd',
          phone_number: session.phoneNumber
        }
      });
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  }

  // Utility methods
  private getText(key: string, language: USSDLanguage): string {
    return MENU_TEXTS[language]?.[key as keyof typeof MENU_TEXTS['en']] || 
           MENU_TEXTS.en[key as keyof typeof MENU_TEXTS['en']] || 
           'Text not found';
  }

  private handleInvalidOption(session: USSDSession): USSDResponse {
    return {
      message: this.getText('invalid_option', session.language),
      continueSession: true
    };
  }

  private goBack(session: USSDSession): USSDResponse {
    const previousMenu = session.menuStack.pop() || 'main';
    session.currentMenu = previousMenu;
    
    if (previousMenu === 'main') {
      return {
        message: this.getText('welcome', session.language),
        continueSession: true
      };
    }
    
    return {
      message: this.getText(previousMenu, session.language),
      continueSession: true
    };
  }

  private getSession(sessionId: string): USSDSession | undefined {
    return this.sessions.get(sessionId);
  }

  private async detectUserLanguage(phoneNumber: string): Promise<USSDLanguage> {
    // Try to get saved language preference
    try {
      const user = await this.findUserByPhoneNumber(phoneNumber);
      if (user?.language_preference) {
        return user.language_preference as USSDLanguage;
      }
    } catch (error) {
      console.error('Error detecting user language:', error);
    }

    // Default language detection based on country code
    const countryCode = phoneNumber.substring(0, 3);
    const languageMap: Record<string, USSDLanguage> = {
      '254': 'sw', // Kenya - Swahili
      '255': 'sw', // Tanzania - Swahili  
      '256': 'en', // Uganda - English
      '233': 'en', // Ghana - English
      '234': 'ha', // Nigeria - Hausa
      '237': 'fr', // Cameroon - French
      '225': 'fr', // Ivory Coast - French
      '223': 'fr', // Mali - French
      '221': 'fr'  // Senegal - French
    };

    return languageMap[countryCode] || 'en';
  }

  private async findUserByPhoneNumber(phoneNumber: string): Promise<any> {
    try {
      const users = await this.dbService.query('profiles', { 
        phone_number: phoneNumber 
      });
      return users[0] || null;
    } catch (error) {
      console.error('Error finding user by phone number:', error);
      return null;
    }
  }

  private async saveUserLanguagePreference(phoneNumber: string, language: USSDLanguage): Promise<void> {
    try {
      const user = await this.findUserByPhoneNumber(phoneNumber);
      if (user) {
        await this.dbService.update('profiles', user.id, {
          language_preference: language
        });
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expirationTime = 10 * 60 * 1000; // 10 minutes
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > expirationTime) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Placeholder methods for additional features
  private getFieldActivities(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private getHarvestRecords(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private getEquipmentStatus(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private getWeatherForecast(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private getRainfallAlert(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private getPlantingAdvice(session: USSDSession): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private handleMarketPricesMenu(session: USSDSession, input: string): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private handleExpertAdviceMenu(session: USSDSession, input: string): USSDResponse {
    return {
      message: this.getText('coming_soon', session.language),
      continueSession: true
    };
  }

  private handleCropHealthMenu(session: USSDSession, input: string): USSDResponse {
    return this.goBack(session);
  }

  private handleTodayWeather(session: USSDSession, input: string): USSDResponse {
    return this.goBack(session);
  }

  private handleMarketCropSelection(session: USSDSession, input: string): USSDResponse {
    return this.goBack(session);
  }

  private handleActivityTypeSelection(session: USSDSession, input: string): USSDResponse {
    return this.goBack(session);
  }
}

export default USSDService;