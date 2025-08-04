/**
 * Farm Visit Scheduling Service
 * Handles scheduling, availability, conflict resolution, and automated notifications
 */

import { supabase } from '@/lib/supabase';

export interface VisitScheduleRequest {
  tenantId: string;
  farmId: string;
  visitorId: string;
  visitType: 'inspection' | 'advisory' | 'training' | 'maintenance' | 'emergency';
  scheduledDate: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  checklist?: string[];
  automaticRescheduling?: boolean;
}

export interface VisitorAvailability {
  visitorId: string;
  date: string;
  timeSlots: {
    startTime: string;
    endTime: string;
    available: boolean;
    conflict?: string;
  }[];
}

export interface SchedulingConflict {
  type: 'time_overlap' | 'travel_time' | 'capacity_exceeded' | 'weather_risk';
  message: string;
  suggestion?: string;
  alternativeTimes?: string[];
}

class VisitSchedulingService {
  private readonly WORKING_HOURS = {
    start: 8, // 8 AM
    end: 18,  // 6 PM
  };

  private readonly TIME_SLOT_MINUTES = 30;
  private readonly TRAVEL_TIME_BUFFER_MINUTES = 30;
  private readonly MAX_VISITS_PER_DAY = 4;

  /**
   * Schedule a new farm visit with conflict detection
   */
  async scheduleVisit(request: VisitScheduleRequest): Promise<{
    success: boolean;
    visitId?: string;
    conflicts?: SchedulingConflict[];
  }> {
    try {
      // 1. Check for scheduling conflicts
      const conflicts = await this.detectSchedulingConflicts(request);
      
      if (conflicts.length > 0 && !request.automaticRescheduling) {
        return {
          success: false,
          conflicts
        };
      }

      // 2. Auto-reschedule if conflicts exist and auto-rescheduling is enabled
      let finalRequest = request;
      if (conflicts.length > 0 && request.automaticRescheduling) {
        const alternativeTime = await this.findAlternativeTime(request);
        if (alternativeTime) {
          finalRequest = { ...request, scheduledDate: alternativeTime };
        } else {
          return {
            success: false,
            conflicts: [{
              type: 'capacity_exceeded',
              message: 'No alternative time slots available',
              suggestion: 'Please select a different date or visitor'
            }]
          };
        }
      }

      // 3. Create the visit record
      const { data: visit, error } = await supabase
        .from('farm_visits')
        .insert({
          tenant_id: finalRequest.tenantId,
          farm_id: finalRequest.farmId,
          visitor_id: finalRequest.visitorId,
          visit_type: finalRequest.visitType,
          scheduled_date: finalRequest.scheduledDate,
          duration_minutes: finalRequest.durationMinutes,
          status: 'scheduled',
          priority: finalRequest.priority,
          description: finalRequest.description,
          checklist: finalRequest.checklist?.map((item, index) => ({
            id: `item_${index}`,
            item,
            completed: false
          })) || []
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Send notifications
      await this.sendSchedulingNotifications(visit);

      // 5. Create calendar event if integration exists
      await this.createCalendarEvent(visit);

      return {
        success: true,
        visitId: visit.id
      };

    } catch (error) {
      console.error('Error scheduling visit:', error);
      throw error;
    }
  }

  /**
   * Detect potential scheduling conflicts
   */
  async detectSchedulingConflicts(request: VisitScheduleRequest): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];
    const requestDate = new Date(request.scheduledDate);

    try {
      // 1. Check for time overlaps with existing visits
      const existingVisits = await this.getVisitsForVisitor(
        request.visitorId,
        requestDate,
        request.tenantId
      );

      for (const existingVisit of existingVisits) {
        const existingStart = new Date(existingVisit.scheduled_date);
        const existingEnd = new Date(existingStart.getTime() + existingVisit.duration_minutes * 60000);
        const requestEnd = new Date(requestDate.getTime() + request.durationMinutes * 60000);

        // Check for direct overlap
        if (requestDate < existingEnd && requestEnd > existingStart) {
          conflicts.push({
            type: 'time_overlap',
            message: `Conflicts with existing ${existingVisit.visit_type} visit`,
            suggestion: 'Choose a different time slot',
            alternativeTimes: await this.suggestAlternativeTimes(request)
          });
        }

        // Check travel time between visits
        const timeBetween = Math.abs(requestDate.getTime() - existingStart.getTime()) / (1000 * 60);
        if (timeBetween < this.TRAVEL_TIME_BUFFER_MINUTES && timeBetween > 0) {
          const distance = await this.estimateTravelTime(
            request.farmId,
            existingVisit.farm_id
          );
          
          if (distance > this.TRAVEL_TIME_BUFFER_MINUTES) {
            conflicts.push({
              type: 'travel_time',
              message: `Insufficient travel time between visits (${distance} minutes needed)`,
              suggestion: `Allow at least ${distance} minutes between visits`
            });
          }
        }
      }

      // 2. Check daily capacity
      const dailyVisits = existingVisits.filter(visit => {
        const visitDate = new Date(visit.scheduled_date);
        return visitDate.toDateString() === requestDate.toDateString();
      });

      if (dailyVisits.length >= this.MAX_VISITS_PER_DAY) {
        conflicts.push({
          type: 'capacity_exceeded',
          message: `Maximum visits per day (${this.MAX_VISITS_PER_DAY}) exceeded`,
          suggestion: 'Schedule for a different day'
        });
      }

      // 3. Check weather risks for outdoor visits
      if (request.visitType === 'inspection' || request.visitType === 'training') {
        const weatherRisk = await this.checkWeatherRisk(request.scheduledDate);
        if (weatherRisk) {
          conflicts.push({
            type: 'weather_risk',
            message: weatherRisk,
            suggestion: 'Consider rescheduling or indoor alternative'
          });
        }
      }

      // 4. Check working hours
      const hour = requestDate.getHours();
      if (hour < this.WORKING_HOURS.start || hour >= this.WORKING_HOURS.end) {
        conflicts.push({
          type: 'time_overlap',
          message: `Outside working hours (${this.WORKING_HOURS.start}:00 - ${this.WORKING_HOURS.end}:00)`,
          suggestion: 'Schedule within working hours'
        });
      }

    } catch (error) {
      console.error('Error detecting conflicts:', error);
    }

    return conflicts;
  }

  /**
   * Get visitor availability for a date range
   */
  async getVisitorAvailability(
    visitorIds: string[],
    startDate: string,
    endDate: string,
    tenantId: string
  ): Promise<VisitorAvailability[]> {
    const availability: VisitorAvailability[] = [];

    try {
      for (const visitorId of visitorIds) {
        const existingVisits = await this.getVisitsForVisitorRange(
          visitorId,
          startDate,
          endDate,
          tenantId
        );

        const dates = this.getDateRange(new Date(startDate), new Date(endDate));
        
        for (const date of dates) {
          const dateString = date.toISOString().split('T')[0];
          const dayVisits = existingVisits.filter(visit => {
            const visitDate = new Date(visit.scheduled_date);
            return visitDate.toDateString() === date.toDateString();
          });

          const timeSlots = this.generateTimeSlots(date, dayVisits);
          
          availability.push({
            visitorId,
            date: dateString,
            timeSlots
          });
        }
      }

    } catch (error) {
      console.error('Error getting availability:', error);
    }

    return availability;
  }

  /**
   * Find alternative time for scheduling
   */
  async findAlternativeTime(request: VisitScheduleRequest): Promise<string | null> {
    const startDate = new Date(request.scheduledDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // Look 7 days ahead

    try {
      const availability = await this.getVisitorAvailability(
        [request.visitorId],
        startDate.toISOString(),
        endDate.toISOString(),
        request.tenantId
      );

      // Find first available slot that can accommodate the duration
      for (const dayAvailability of availability) {
        for (const slot of dayAvailability.timeSlots) {
          if (slot.available) {
            const slotDateTime = new Date(`${dayAvailability.date}T${slot.startTime}`);
            const slotEndTime = new Date(slotDateTime.getTime() + request.durationMinutes * 60000);
            
            // Check if the slot is long enough
            const slotDuration = new Date(`${dayAvailability.date}T${slot.endTime}`).getTime() - slotDateTime.getTime();
            
            if (slotDuration >= request.durationMinutes * 60000) {
              return slotDateTime.toISOString();
            }
          }
        }
      }

    } catch (error) {
      console.error('Error finding alternative time:', error);
    }

    return null;
  }

  /**
   * Suggest alternative times for a scheduling request
   */
  private async suggestAlternativeTimes(request: VisitScheduleRequest): Promise<string[]> {
    const suggestions: string[] = [];
    const requestDate = new Date(request.scheduledDate);

    // Suggest same day, different times
    for (let hourOffset = 2; hourOffset <= 4; hourOffset += 2) {
      const altTime = new Date(requestDate.getTime() + hourOffset * 60 * 60 * 1000);
      if (altTime.getHours() < this.WORKING_HOURS.end) {
        const conflicts = await this.detectSchedulingConflicts({
          ...request,
          scheduledDate: altTime.toISOString()
        });
        
        if (conflicts.length === 0) {
          suggestions.push(altTime.toISOString());
        }
      }
    }

    // Suggest next available days
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const altDate = new Date(requestDate);
      altDate.setDate(altDate.getDate() + dayOffset);
      altDate.setHours(requestDate.getHours());

      const conflicts = await this.detectSchedulingConflicts({
        ...request,
        scheduledDate: altDate.toISOString()
      });
      
      if (conflicts.length === 0) {
        suggestions.push(altDate.toISOString());
      }
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Estimate travel time between two farms
   */
  private async estimateTravelTime(farmId1: string, farmId2: string): Promise<number> {
    try {
      // Get farm locations
      const { data: farms, error } = await supabase
        .from('farms')
        .select('id, latitude, longitude, location')
        .in('id', [farmId1, farmId2]);

      if (error || !farms || farms.length !== 2) {
        return this.TRAVEL_TIME_BUFFER_MINUTES; // Default buffer
      }

      const [farm1, farm2] = farms;

      // Simple distance-based estimation (replace with actual routing service)
      if (farm1.latitude && farm1.longitude && farm2.latitude && farm2.longitude) {
        const distance = this.calculateDistance(
          farm1.latitude, farm1.longitude,
          farm2.latitude, farm2.longitude
        );
        
        // Assume 40 km/h average speed in rural areas
        return Math.ceil((distance / 40) * 60); // Convert to minutes
      }

      // Fallback to location-based estimation
      if (farm1.location && farm2.location) {
        const isSameArea = farm1.location.toLowerCase().includes(farm2.location.toLowerCase()) ||
                          farm2.location.toLowerCase().includes(farm1.location.toLowerCase());
        return isSameArea ? 15 : this.TRAVEL_TIME_BUFFER_MINUTES;
      }

    } catch (error) {
      console.error('Error estimating travel time:', error);
    }

    return this.TRAVEL_TIME_BUFFER_MINUTES;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check weather risks for a given date
   */
  private async checkWeatherRisk(scheduledDate: string): Promise<string | null> {
    try {
      // This would integrate with a weather API
      // For now, return null (no weather risk detected)
      
      // Example implementation:
      // const weather = await weatherAPI.getForecast(scheduledDate);
      // if (weather.precipitationProbability > 80) {
      //   return 'High chance of rain expected';
      // }
      // if (weather.windSpeed > 25) {
      //   return 'Strong winds expected - outdoor activities may be difficult';
      // }
      
    } catch (error) {
      console.error('Error checking weather:', error);
    }

    return null;
  }

  /**
   * Generate time slots for a given date
   */
  private generateTimeSlots(date: Date, existingVisits: any[]): any[] {
    const slots = [];
    const startHour = this.WORKING_HOURS.start;
    const endHour = this.WORKING_HOURS.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += this.TIME_SLOT_MINUTES) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + this.TIME_SLOT_MINUTES * 60000);
        
        // Check if this slot conflicts with existing visits
        const hasConflict = existingVisits.some(visit => {
          const visitStart = new Date(visit.scheduled_date);
          const visitEnd = new Date(visitStart.getTime() + visit.duration_minutes * 60000);
          
          return slotStart < visitEnd && slotEnd > visitStart;
        });

        slots.push({
          startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          endTime: `${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`,
          available: !hasConflict && slotStart > new Date(),
          conflict: hasConflict ? 'Existing visit' : undefined
        });
      }
    }

    return slots;
  }

  /**
   * Get visits for a visitor on a specific date
   */
  private async getVisitsForVisitor(
    visitorId: string,
    date: Date,
    tenantId: string
  ): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('farm_visits')
      .select('*')
      .eq('visitor_id', visitorId)
      .eq('tenant_id', tenantId)
      .gte('scheduled_date', startOfDay.toISOString())
      .lt('scheduled_date', endOfDay.toISOString())
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get visits for a visitor in a date range
   */
  private async getVisitsForVisitorRange(
    visitorId: string,
    startDate: string,
    endDate: string,
    tenantId: string
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('farm_visits')
      .select('*')
      .eq('visitor_id', visitorId)
      .eq('tenant_id', tenantId)
      .gte('scheduled_date', startDate)
      .lt('scheduled_date', endDate)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error fetching visits range:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Generate date range between two dates
   */
  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Send notifications about scheduled visit
   */
  private async sendSchedulingNotifications(visit: any): Promise<void> {
    try {
      // Get farm and visitor details
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select(`
          *,
          owner:profiles!farms_owner_id_fkey(*)
        `)
        .eq('id', visit.farm_id)
        .single();

      if (farmError) throw farmError;

      const { data: visitor, error: visitorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', visit.visitor_id)
        .single();

      if (visitorError) throw visitorError;

      // Notify farm owner
      await supabase
        .from('notifications')
        .insert({
          tenant_id: visit.tenant_id,
          user_id: farm.owner_id,
          title: 'Farm Visit Scheduled',
          message: `${visitor.full_name} has scheduled a ${visit.visit_type} visit for ${new Date(visit.scheduled_date).toLocaleDateString()}`,
          type: 'farm_visit',
          metadata: {
            visit_id: visit.id,
            visitor_name: visitor.full_name,
            visit_type: visit.visit_type,
            scheduled_date: visit.scheduled_date
          }
        });

      // Notify visitor
      await supabase
        .from('notifications')
        .insert({
          tenant_id: visit.tenant_id,
          user_id: visit.visitor_id,
          title: 'Visit Confirmed',
          message: `Your ${visit.visit_type} visit to ${farm.name} is confirmed for ${new Date(visit.scheduled_date).toLocaleDateString()}`,
          type: 'farm_visit',
          metadata: {
            visit_id: visit.id,
            farm_name: farm.name,
            visit_type: visit.visit_type,
            scheduled_date: visit.scheduled_date
          }
        });

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  /**
   * Create calendar event (placeholder for calendar integration)
   */
  private async createCalendarEvent(visit: any): Promise<void> {
    try {
      // This would integrate with Google Calendar, Outlook, etc.
      console.log('Calendar event created for visit:', visit.id);
      
      // Example calendar event data
      const event = {
        title: `Farm Visit - ${visit.visit_type}`,
        start: visit.scheduled_date,
        duration: visit.duration_minutes,
        description: visit.description,
        location: visit.farm?.location
      };

      // TODO: Implement actual calendar integration
      
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  }
}

export const visitSchedulingService = new VisitSchedulingService();
export default visitSchedulingService;