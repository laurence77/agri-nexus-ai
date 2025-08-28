import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { ProvenanceService } from '@/lib/provenance';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: SupportCategory;
  priority: TicketPriority;
  severity: TicketSeverity;
  status: TicketStatus;
  channel: SupportChannel;
  tags: string[];
  
  // Assignment & Routing
  assigned_to?: string;
  assigned_team?: string;
  escalation_level: number; // 0=L1, 1=L2, 2=L3, 3=Engineering
  escalation_history: EscalationEvent[];
  
  // SLA & Timing
  sla_category: SLACategory;
  response_due: string;
  resolution_due: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  
  // Context & Metadata
  user_context: UserContext;
  technical_context: TechnicalContext;
  business_impact: BusinessImpact;
  affected_systems: string[];
  related_tickets: string[];
  
  // Communication
  communications: TicketCommunication[];
  internal_notes: InternalNote[];
  customer_satisfaction_score?: number;
  
  created_at: string;
  updated_at: string;
}

export type SupportCategory = 
  | 'technical_issue'
  | 'feature_request'
  | 'account_access'
  | 'billing_payment'
  | 'data_sync'
  | 'training_help'
  | 'bug_report'
  | 'integration_issue'
  | 'performance'
  | 'security_concern';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type TicketSeverity = 'minor' | 'moderate' | 'major' | 'critical' | 'blocker';

export type TicketStatus = 
  | 'new'
  | 'acknowledged'
  | 'in_progress'
  | 'escalated'
  | 'pending_customer'
  | 'pending_vendor'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type SupportChannel = 'web_form' | 'email' | 'phone' | 'chat' | 'mobile_app' | 'emergency_line';

export type SLACategory = 'standard' | 'premium' | 'enterprise' | 'critical_infrastructure';

export interface EscalationEvent {
  id: string;
  from_level: number;
  to_level: number;
  from_assignee?: string;
  to_assignee: string;
  reason: EscalationReason;
  escalated_by: string;
  escalated_at: string;
  notes?: string;
}

export type EscalationReason = 
  | 'sla_breach'
  | 'complexity'
  | 'customer_request'
  | 'expertise_required'
  | 'management_escalation'
  | 'critical_impact'
  | 'repeated_issue';

export interface UserContext {
  role: string;
  tenure_days: number;
  engagement_score: number;
  subscription_tier: string;
  farm_size_acres?: number;
  primary_crops?: string[];
  location?: string;
  language_preference?: string;
  timezone?: string;
  previous_tickets_count: number;
  last_login: string;
}

export interface TechnicalContext {
  browser?: string;
  device_type?: string;
  operating_system?: string;
  app_version?: string;
  feature_flags?: Record<string, boolean>;
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  error_logs?: string[];
  stack_trace?: string;
  reproduction_steps?: string[];
}

export interface BusinessImpact {
  affects_revenue: boolean;
  affects_operations: boolean;
  affects_compliance: boolean;
  users_affected_count: number;
  estimated_loss_per_hour?: number;
  seasonal_impact?: 'high' | 'medium' | 'low';
  planting_season_critical?: boolean;
  harvest_season_critical?: boolean;
}

export interface TicketCommunication {
  id: string;
  type: 'customer_message' | 'agent_response' | 'system_update' | 'escalation_note';
  from_user_id?: string;
  from_agent_id?: string;
  message: string;
  channel: SupportChannel;
  is_internal: boolean;
  attachments?: string[];
  read_by_customer: boolean;
  read_at?: string;
  created_at: string;
}

export interface InternalNote {
  id: string;
  author_id: string;
  content: string;
  note_type: 'investigation' | 'solution' | 'escalation' | 'customer_info' | 'followup';
  is_visible_to_customer: boolean;
  created_at: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  specializations: string[];
  languages: string[];
  current_capacity: number;
  max_capacity: number;
  shift_schedule: ShiftSchedule;
  performance_metrics: AgentMetrics;
  is_available: boolean;
  status: AgentStatus;
}

export type AgentRole = 'l1_support' | 'l2_specialist' | 'l3_expert' | 'engineer' | 'manager' | 'escalation_specialist';

export type AgentStatus = 'available' | 'busy' | 'away' | 'offline' | 'break' | 'training';

export interface ShiftSchedule {
  timezone: string;
  working_hours: {
    monday: [string, string] | null;
    tuesday: [string, string] | null;
    wednesday: [string, string] | null;
    thursday: [string, string] | null;
    friday: [string, string] | null;
    saturday: [string, string] | null;
    sunday: [string, string] | null;
  };
}

export interface AgentMetrics {
  total_tickets_handled: number;
  average_first_response_time_hours: number;
  average_resolution_time_hours: number;
  customer_satisfaction_average: number;
  escalation_rate: number;
  reopened_ticket_rate: number;
  sla_breach_rate: number;
}

export interface EscalationRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface EscalationCondition {
  type: 'sla_breach' | 'keyword_match' | 'customer_tier' | 'severity_level' | 'category_match' | 'time_in_status' | 'failed_resolution_attempts';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list';
  value: any;
  threshold?: number;
}

export interface EscalationAction {
  type: 'assign_to_agent' | 'assign_to_team' | 'increase_priority' | 'send_notification' | 'create_incident' | 'schedule_callback' | 'trigger_sms';
  parameters: Record<string, any>;
  delay_minutes?: number;
}

export interface SupportMetrics {
  total_tickets: number;
  open_tickets: number;
  tickets_created_today: number;
  tickets_resolved_today: number;
  average_first_response_time_hours: number;
  average_resolution_time_hours: number;
  customer_satisfaction_score: number;
  sla_compliance_rate: number;
  escalation_rate: number;
  agent_utilization_rate: number;
  top_categories: Array<{ category: string; count: number }>;
  trend_analysis: {
    ticket_volume_trend: 'increasing' | 'stable' | 'decreasing';
    resolution_time_trend: 'improving' | 'stable' | 'degrading';
  };
}

export class SupportEscalationService {
  private static supabase = supabase;

  /**
   * Create a support ticket with intelligent routing
   */
  static async createTicket(
    ticketData: Omit<SupportTicket, 'id' | 'ticket_number' | 'escalation_history' | 'communications' | 'internal_notes' | 'created_at' | 'updated_at'>
  ): Promise<SupportTicket> {
    try {
      const ticketNumber = await this.generateTicketNumber();
      
      // Determine initial priority and severity based on context
      const { priority, severity } = await this.assessTicketUrgency(ticketData);
      
      // Calculate SLA deadlines
      const slaDeadlines = this.calculateSLADeadlines(priority, ticketData.sla_category);
      
      // Find best agent for assignment
      const assignedAgent = await this.findBestAgent(ticketData.category, priority, ticketData.user_context.language_preference);

      const ticket: Omit<SupportTicket, 'id'> = {
        ...ticketData,
        ticket_number: ticketNumber,
        priority,
        severity,
        escalation_level: 0, // Start at L1
        escalation_history: [],
        response_due: slaDeadlines.response_due,
        resolution_due: slaDeadlines.resolution_due,
        assigned_to: assignedAgent?.id,
        assigned_team: assignedAgent?.role === 'l1_support' ? 'L1_Support' : 'L2_Specialist',
        communications: [],
        internal_notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store ticket in database
      const { data: createdTicket, error } = await this.supabase
        .from('support_tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;

      // Record provenance for all initial fields
      await ProvenanceService.recordRecordChanges(
        'support_tickets',
        createdTicket.id,
        {
          title: { newValue: ticket.title },
          description: { newValue: ticket.description },
          category: { newValue: ticket.category },
          priority: { newValue: ticket.priority },
          severity: { newValue: ticket.severity },
          status: { newValue: ticket.status },
          channel: { newValue: ticket.channel },
          assigned_to: { newValue: ticket.assigned_to },
          assigned_team: { newValue: ticket.assigned_team },
          escalation_level: { newValue: ticket.escalation_level },
          response_due: { newValue: ticket.response_due },
          resolution_due: { newValue: ticket.resolution_due }
        },
        {
          source: ticketData.channel === 'web_form' ? 'user' : 'api',
          entered_by: ticketData.user_id,
          transformation: 'auto_assigned_priority_severity'
        }
      );

      // Send initial acknowledgment
      await this.sendAcknowledgment(createdTicket.id);

      // Apply escalation rules
      await this.applyEscalationRules(createdTicket.id);

      // Log ticket creation
      await SecurityService.logUserActivity({
        userId: ticketData.user_id,
        tenantId: ticketData.tenant_id,
        action: 'support_ticket_created',
        resourceType: 'support_ticket',
        resourceId: createdTicket.id,
        success: true,
        metadata: {
          ticket_number: ticketNumber,
          category: ticketData.category,
          priority,
          assigned_to: assignedAgent?.id
        }
      });

      return createdTicket;

    } catch (error) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  /**
   * Escalate ticket to next level
   */
  static async escalateTicket(
    ticketId: string,
    reason: EscalationReason,
    escalatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Get current ticket
      const { data: ticket } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (!ticket) throw new Error('Ticket not found');

      const currentLevel = ticket.escalation_level;
      const nextLevel = Math.min(currentLevel + 1, 3); // Max level 3

      // Find appropriate agent for next level
      const targetAgent = await this.findEscalationTarget(nextLevel, ticket.category, ticket.user_context.language_preference);

      // Create escalation event
      const escalationEvent: EscalationEvent = {
        id: `escalation_${Date.now()}`,
        from_level: currentLevel,
        to_level: nextLevel,
        from_assignee: ticket.assigned_to,
        to_assignee: targetAgent.id,
        reason,
        escalated_by: escalatedBy,
        escalated_at: new Date().toISOString(),
        notes
      };

      // Update ticket
      const updatedEscalationHistory = [...ticket.escalation_history, escalationEvent];
      
      await this.supabase
        .from('support_tickets')
        .update({
          escalation_level: nextLevel,
          assigned_to: targetAgent.id,
          assigned_team: this.getTeamForLevel(nextLevel),
          status: 'escalated',
          escalation_history: updatedEscalationHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      // Record provenance for escalated fields
      await ProvenanceService.recordRecordChanges(
        'support_tickets',
        ticketId,
        {
          escalation_level: { newValue: nextLevel, previousValue: currentLevel },
          assigned_to: { newValue: targetAgent.id, previousValue: ticket.assigned_to },
          assigned_team: { newValue: this.getTeamForLevel(nextLevel), previousValue: ticket.assigned_team },
          status: { newValue: 'escalated', previousValue: ticket.status },
          escalation_history: { newValue: updatedEscalationHistory, previousValue: ticket.escalation_history }
        },
        {
          source: escalatedBy === 'system' ? 'system' : 'user',
          entered_by: escalatedBy,
          transformation: `escalated_to_level_${nextLevel + 1}`
        }
      );

      // Notify new assignee
      await this.notifyAssignee(targetAgent.id, ticketId, 'escalation');

      // Add internal note
      await this.addInternalNote(ticketId, escalatedBy, `Escalated to Level ${nextLevel + 1}: ${reason}. ${notes || ''}`, 'escalation');

      // Log escalation
      await SecurityService.logUserActivity({
        userId: escalatedBy,
        tenantId: ticket.tenant_id,
        action: 'support_ticket_escalated',
        resourceType: 'support_ticket',
        resourceId: ticketId,
        success: true,
        metadata: {
          from_level: currentLevel,
          to_level: nextLevel,
          reason,
          to_assignee: targetAgent.id
        }
      });

    } catch (error) {
      console.error('Ticket escalation failed:', error);
      throw error;
    }
  }

  /**
   * Monitor tickets for automatic escalation
   */
  static async monitorTicketsForEscalation(): Promise<number> {
    try {
      let escalatedCount = 0;

      // Find tickets that need escalation
      const { data: tickets } = await this.supabase
        .from('support_tickets')
        .select('*')
        .in('status', ['new', 'acknowledged', 'in_progress'])
        .lt('response_due', new Date().toISOString());

      if (!tickets) return 0;

      for (const ticket of tickets) {
        // Check if already escalated recently
        const lastEscalation = ticket.escalation_history?.[ticket.escalation_history.length - 1];
        const recentEscalation = lastEscalation && 
          new Date(lastEscalation.escalated_at).getTime() > Date.now() - 60 * 60 * 1000; // Last hour

        if (!recentEscalation) {
          await this.escalateTicket(
            ticket.id,
            'sla_breach',
            'system',
            `Automatic escalation due to SLA breach. Response was due at ${ticket.response_due}`
          );
          escalatedCount++;
        }
      }

      return escalatedCount;

    } catch (error) {
      console.error('Ticket monitoring failed:', error);
      return 0;
    }
  }

  /**
   * Get support dashboard metrics
   */
  static async getSupportMetrics(tenantId: string): Promise<SupportMetrics> {
    try {
      const [
        totalTickets,
        openTickets,
        todayTickets,
        resolvedToday,
        avgResponseTime,
        avgResolutionTime,
        satisfaction,
        slaCompliance,
        escalationRate,
        categories
      ] = await Promise.all([
        // Total tickets
        this.supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId),
        
        // Open tickets
        this.supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .in('status', ['new', 'acknowledged', 'in_progress', 'escalated']),
        
        // Tickets created today
        this.supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', new Date().toISOString().split('T')[0]),
        
        // Tickets resolved today
        this.supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'resolved')
          .gte('resolved_at', new Date().toISOString().split('T')[0]),
        
        // Average response time (mock for now)
        Promise.resolve(4.2),
        
        // Average resolution time (mock for now)
        Promise.resolve(18.6),
        
        // Customer satisfaction (mock for now)
        Promise.resolve(4.3),
        
        // SLA compliance rate (mock for now)
        Promise.resolve(92.5),
        
        // Escalation rate (mock for now)
        Promise.resolve(8.3),
        
        // Top categories
        this.supabase
          .from('support_tickets')
          .select('category')
          .eq('tenant_id', tenantId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Process category data
      const categoryCount: Record<string, number> = {};
      categories.data?.forEach(ticket => {
        categoryCount[ticket.category] = (categoryCount[ticket.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_tickets: totalTickets.count || 0,
        open_tickets: openTickets.count || 0,
        tickets_created_today: todayTickets.count || 0,
        tickets_resolved_today: resolvedToday.count || 0,
        average_first_response_time_hours: avgResponseTime,
        average_resolution_time_hours: avgResolutionTime,
        customer_satisfaction_score: satisfaction,
        sla_compliance_rate: slaCompliance,
        escalation_rate: escalationRate,
        agent_utilization_rate: 78.5, // Mock
        top_categories: topCategories,
        trend_analysis: {
          ticket_volume_trend: 'stable',
          resolution_time_trend: 'improving'
        }
      };

    } catch (error) {
      console.error('Support metrics fetch failed:', error);
      throw error;
    }
  }

  /**
   * Add communication to ticket
   */
  static async addCommunication(
    ticketId: string,
    communication: Omit<TicketCommunication, 'id' | 'created_at'>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ticket_communications')
        .insert({
          ticket_id: ticketId,
          ...communication,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update ticket status if needed
      if (communication.type === 'agent_response' && communication.from_agent_id) {
        await this.supabase
          .from('support_tickets')
          .update({
            status: 'in_progress',
            first_response_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId)
          .is('first_response_at', null);
      }

    } catch (error) {
      console.error('Communication addition failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async generateTicketNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${timestamp}-${random}`;
  }

  private static async assessTicketUrgency(ticketData: any): Promise<{ priority: TicketPriority; severity: TicketSeverity }> {
    let priority: TicketPriority = 'normal';
    let severity: TicketSeverity = 'moderate';

    // Business impact assessment
    if (ticketData.business_impact?.affects_revenue || ticketData.business_impact?.planting_season_critical) {
      priority = 'urgent';
      severity = 'major';
    }

    // User context assessment
    if (ticketData.user_context?.subscription_tier === 'enterprise') {
      priority = priority === 'normal' ? 'high' : priority;
    }

    // Category-based assessment
    if (ticketData.category === 'security_concern') {
      priority = 'critical';
      severity = 'blocker';
    }

    return { priority, severity };
  }

  private static calculateSLADeadlines(priority: TicketPriority, slaCategory: SLACategory): {
    response_due: string;
    resolution_due: string;
  } {
    const now = new Date();
    let responseHours = 24;
    let resolutionHours = 72;

    // Adjust based on priority
    switch (priority) {
      case 'critical':
        responseHours = 1;
        resolutionHours = 4;
        break;
      case 'urgent':
        responseHours = 2;
        resolutionHours = 8;
        break;
      case 'high':
        responseHours = 4;
        resolutionHours = 24;
        break;
      case 'normal':
        responseHours = 8;
        resolutionHours = 48;
        break;
      case 'low':
        responseHours = 24;
        resolutionHours = 120;
        break;
    }

    // Adjust based on SLA category
    if (slaCategory === 'enterprise') {
      responseHours = Math.floor(responseHours * 0.5);
      resolutionHours = Math.floor(resolutionHours * 0.7);
    }

    return {
      response_due: new Date(now.getTime() + responseHours * 60 * 60 * 1000).toISOString(),
      resolution_due: new Date(now.getTime() + resolutionHours * 60 * 60 * 1000).toISOString()
    };
  }

  private static async findBestAgent(category: SupportCategory, priority: TicketPriority, language?: string): Promise<SupportAgent | null> {
    // Mock implementation - would query actual agents
    return {
      id: 'agent_1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@agrinexus.ai',
      role: 'l1_support',
      specializations: ['technical_issue', 'data_sync'],
      languages: ['en', 'es'],
      current_capacity: 3,
      max_capacity: 8,
      shift_schedule: {
        timezone: 'America/Chicago',
        working_hours: {
          monday: ['09:00', '17:00'],
          tuesday: ['09:00', '17:00'],
          wednesday: ['09:00', '17:00'],
          thursday: ['09:00', '17:00'],
          friday: ['09:00', '17:00'],
          saturday: null,
          sunday: null
        }
      },
      performance_metrics: {
        total_tickets_handled: 245,
        average_first_response_time_hours: 2.1,
        average_resolution_time_hours: 12.4,
        customer_satisfaction_average: 4.6,
        escalation_rate: 12.3,
        reopened_ticket_rate: 3.2,
        sla_breach_rate: 2.8
      },
      is_available: true,
      status: 'available'
    };
  }

  private static async findEscalationTarget(level: number, category: SupportCategory, language?: string): Promise<SupportAgent> {
    // Mock implementation
    const roles: AgentRole[] = ['l1_support', 'l2_specialist', 'l3_expert', 'engineer'];
    return {
      id: `agent_level_${level}`,
      name: `Level ${level + 1} Specialist`,
      email: `l${level + 1}@agrinexus.ai`,
      role: roles[level],
      specializations: [category],
      languages: ['en'],
      current_capacity: 2,
      max_capacity: 5,
      shift_schedule: {
        timezone: 'America/Chicago',
        working_hours: {
          monday: ['09:00', '17:00'],
          tuesday: ['09:00', '17:00'],
          wednesday: ['09:00', '17:00'],
          thursday: ['09:00', '17:00'],
          friday: ['09:00', '17:00'],
          saturday: null,
          sunday: null
        }
      },
      performance_metrics: {
        total_tickets_handled: 120,
        average_first_response_time_hours: 1.5,
        average_resolution_time_hours: 8.2,
        customer_satisfaction_average: 4.8,
        escalation_rate: 5.1,
        reopened_ticket_rate: 1.8,
        sla_breach_rate: 1.2
      },
      is_available: true,
      status: 'available'
    };
  }

  private static getTeamForLevel(level: number): string {
    const teams = ['L1_Support', 'L2_Specialist', 'L3_Expert', 'Engineering'];
    return teams[level] || 'Engineering';
  }

  private static async sendAcknowledgment(ticketId: string): Promise<void> {
    // Mock implementation - would send actual email/notification
    console.log(`Sending acknowledgment for ticket ${ticketId}`);
  }

  private static async notifyAssignee(agentId: string, ticketId: string, type: 'assignment' | 'escalation'): Promise<void> {
    // Mock implementation - would send actual notification
    console.log(`Notifying agent ${agentId} about ticket ${ticketId} (${type})`);
  }

  private static async addInternalNote(ticketId: string, authorId: string, content: string, type: InternalNote['note_type']): Promise<void> {
    try {
      await this.supabase
        .from('ticket_internal_notes')
        .insert({
          ticket_id: ticketId,
          author_id: authorId,
          content,
          note_type: type,
          is_visible_to_customer: false,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to add internal note:', error);
    }
  }

  private static async applyEscalationRules(ticketId: string): Promise<void> {
    // Mock implementation - would apply actual escalation rules
    console.log(`Applying escalation rules for ticket ${ticketId}`);
  }
}

export default SupportEscalationService;
