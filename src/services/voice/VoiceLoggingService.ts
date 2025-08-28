import { createClient } from '@supabase/supabase-js'

interface VoiceSession {
  id: string
  userId: string
  farmId?: string
  startTime: Date
  endTime?: Date
  language: string
  deviceInfo: {
    userAgent: string
    platform: string
    isLowLiteracy: boolean
  }
  totalInteractions: number
  successfulCommands: number
  status: 'active' | 'completed' | 'interrupted'
}

interface VoiceInteraction {
  id: string
  sessionId: string
  timestamp: Date
  audioFileUrl?: string
  transcription: string
  confidence: number
  intent: string
  entities: Record<string, any>
  response: string
  success: boolean
  language: string
  duration: number
  retryCount: number
}

interface VoiceAnalytics {
  userId: string
  date: Date
  totalSessions: number
  totalInteractions: number
  averageConfidence: number
  successRate: number
  mostUsedCommands: Record<string, number>
  languageUsage: Record<string, number>
  errorPatterns: Record<string, number>
}

class VoiceLoggingService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    // WARNING: Do not expose service role key in client. Use anon key or server proxy in production.
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  async createVoiceSession(sessionData: Omit<VoiceSession, 'id'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('voice_sessions')
      .insert(sessionData)
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async logVoiceInteraction(interaction: Omit<VoiceInteraction, 'id'>): Promise<void> {
    const { error } = await this.supabase
      .from('voice_interactions')
      .insert(interaction)

    if (error) throw error

    // Update session statistics
    await this.updateSessionStats(interaction.sessionId)
  }

  async storeAudioFile(
    sessionId: string, 
    interactionId: string, 
    audioBlob: Blob
  ): Promise<string> {
    const fileName = `voice-logs/${sessionId}/${interactionId}-${Date.now()}.wav`
    
    const { data, error } = await this.supabase.storage
      .from('voice-recordings')
      .upload(fileName, audioBlob, {
        contentType: 'audio/wav',
        upsert: false
      })

    if (error) throw error

    const { data: urlData } = this.supabase.storage
      .from('voice-recordings')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  async updateSessionStats(sessionId: string): Promise<void> {
    const { data: interactions } = await this.supabase
      .from('voice_interactions')
      .select('success')
      .eq('session_id', sessionId)

    if (!interactions) return

    const totalInteractions = interactions.length
    const successfulCommands = interactions.filter(i => i.success).length

    await this.supabase
      .from('voice_sessions')
      .update({
        total_interactions: totalInteractions,
        successful_commands: successfulCommands
      })
      .eq('id', sessionId)
  }

  async endVoiceSession(sessionId: string): Promise<void> {
    await this.supabase
      .from('voice_sessions')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', sessionId)
  }

  async getVoiceAnalytics(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<VoiceAnalytics[]> {
    const { data: sessions } = await this.supabase
      .from('voice_sessions')
      .select(`
        *,
        voice_interactions (*)
      `)
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())

    if (!sessions) return []

    // Process analytics data
    const analyticsMap = new Map<string, VoiceAnalytics>()

    sessions.forEach(session => {
      const dateKey = new Date(session.start_time).toDateString()
      
      if (!analyticsMap.has(dateKey)) {
        analyticsMap.set(dateKey, {
          userId,
          date: new Date(session.start_time),
          totalSessions: 0,
          totalInteractions: 0,
          averageConfidence: 0,
          successRate: 0,
          mostUsedCommands: {},
          languageUsage: {},
          errorPatterns: {}
        })
      }

      const analytics = analyticsMap.get(dateKey)!
      analytics.totalSessions++
      analytics.totalInteractions += session.voice_interactions?.length || 0
      
      // Track language usage
      analytics.languageUsage[session.language] = 
        (analytics.languageUsage[session.language] || 0) + 1

      // Process interactions
      session.voice_interactions?.forEach((interaction: any) => {
        // Track command usage
        analytics.mostUsedCommands[interaction.intent] = 
          (analytics.mostUsedCommands[interaction.intent] || 0) + 1

        // Track error patterns for low confidence or failed commands
        if (!interaction.success || interaction.confidence < 0.7) {
          const errorKey = `${interaction.intent}-${interaction.confidence < 0.7 ? 'low-confidence' : 'failed'}`
          analytics.errorPatterns[errorKey] = 
            (analytics.errorPatterns[errorKey] || 0) + 1
        }
      })
    })

    return Array.from(analyticsMap.values())
  }

  async getLowLiteracyUserInsights(userId: string): Promise<{
    averageSessionLength: number
    preferredLanguage: string
    commonFailurePoints: string[]
    successfulCommandPatterns: string[]
    recommendations: string[]
  }> {
    const { data: sessions } = await this.supabase
      .from('voice_sessions')
      .select(`
        *,
        voice_interactions (*)
      `)
      .eq('user_id', userId)
      .eq('device_info->>isLowLiteracy', true)
      .order('start_time', { ascending: false })
      .limit(50)

    if (!sessions || sessions.length === 0) {
      return {
        averageSessionLength: 0,
        preferredLanguage: 'en',
        commonFailurePoints: [],
        successfulCommandPatterns: [],
        recommendations: []
      }
    }

    // Calculate average session length
    const sessionLengths = sessions
      .filter(s => s.end_time)
      .map(s => new Date(s.end_time).getTime() - new Date(s.start_time).getTime())
    
    const averageSessionLength = sessionLengths.length > 0 
      ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length / 1000 // Convert to seconds
      : 0

    // Find preferred language
    const languageCount: Record<string, number> = {}
    sessions.forEach(session => {
      languageCount[session.language] = (languageCount[session.language] || 0) + 1
    })
    const preferredLanguage = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'en'

    // Analyze failure patterns
    const failureReasons: Record<string, number> = {}
    const successPatterns: Record<string, number> = {}

    sessions.forEach(session => {
      session.voice_interactions?.forEach((interaction: any) => {
        if (!interaction.success || interaction.confidence < 0.6) {
          const reason = interaction.confidence < 0.6 ? 'low_confidence' : 'command_failed'
          failureReasons[`${reason}_${interaction.intent}`] = 
            (failureReasons[`${reason}_${interaction.intent}`] || 0) + 1
        } else {
          successPatterns[interaction.intent] = 
            (successPatterns[interaction.intent] || 0) + 1
        }
      })
    })

    const commonFailurePoints = Object.entries(failureReasons)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern]) => pattern)

    const successfulCommandPatterns = Object.entries(successPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern]) => pattern)

    // Generate recommendations
    const recommendations = this.generateLowLiteracyRecommendations(
      averageSessionLength,
      commonFailurePoints,
      successfulCommandPatterns
    )

    return {
      averageSessionLength,
      preferredLanguage,
      commonFailurePoints,
      successfulCommandPatterns,
      recommendations
    }
  }

  private generateLowLiteracyRecommendations(
    avgSessionLength: number,
    failures: string[],
    successes: string[]
  ): string[] {
    const recommendations: string[] = []

    if (avgSessionLength < 30) {
      recommendations.push('Consider adding voice tutorials to increase user comfort')
    }

    if (failures.some(f => f.includes('low_confidence'))) {
      recommendations.push('Implement accent adaptation for better speech recognition')
    }

    if (failures.some(f => f.includes('irrigation'))) {
      recommendations.push('Add visual irrigation system guides with voice narration')
    }

    if (successes.includes('weather')) {
      recommendations.push('User responds well to weather commands - expand weather-related features')
    }

    recommendations.push('Regular voice interaction practice sessions recommended')
    
    return recommendations
  }

  async getVoiceAuditTrail(
    farmId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    interaction: VoiceInteraction
    session: VoiceSession
    audioUrl?: string
  }[]> {
    const { data } = await this.supabase
      .from('voice_interactions')
      .select(`
        *,
        voice_sessions!inner (*)
      `)
      .eq('voice_sessions.farm_id', farmId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    return data?.map(item => ({
      interaction: item,
      session: item.voice_sessions,
      audioUrl: item.audio_file_url
    })) || []
  }
}

export default VoiceLoggingService
