'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { supabase } from '@/lib/supabase';
import '@/styles/glass-agricultural.css';

interface FarmVisit {
  id: string;
  tenant_id: string;
  farm_id: string;
  visitor_id: string;
  visit_type: 'inspection' | 'advisory' | 'training' | 'maintenance' | 'emergency';
  scheduled_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  checklist?: ChecklistItem[];
  farm?: {
    id: string;
    name: string;
    location: string;
    owner: {
      full_name: string;
      phone_number: string;
    };
  };
  visitor?: {
    id: string;
    full_name: string;
    role: string;
    phone_number: string;
  };
  created_at: string;
  completed_at?: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  notes?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  visitor_id?: string;
}

export function FarmVisitScheduler() {
  const { profile, tenant, hasPermission } = useAuth();
  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [agronomists, setAgronomists] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showNewVisitForm, setShowNewVisitForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newVisit, setNewVisit] = useState({
    farm_id: '',
    visitor_id: '',
    visit_type: 'advisory' as const,
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 120,
    priority: 'medium' as const,
    description: '',
    checklist: [] as string[]
  });

  useEffect(() => {
    loadInitialData();
  }, [tenant]);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate, agronomists]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load visits for current week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: visitsData, error: visitsError } = await supabase
        .from('farm_visits')
        .select(`
          *,
          farm:farms!inner(
            id,
            name,
            location,
            owner:profiles!farms_owner_id_fkey(full_name, phone_number)
          ),
          visitor:profiles!farm_visits_visitor_id_fkey(
            id,
            full_name,
            role,
            phone_number
          )
        `)
        .eq('tenant_id', tenant?.id)
        .gte('scheduled_date', weekStart.toISOString())
        .lt('scheduled_date', weekEnd.toISOString())
        .order('scheduled_date', { ascending: true });

      if (visitsError) throw visitsError;
      setVisits(visitsData || []);

      // Load farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select(`
          id,
          name,
          location,
          size_hectares,
          owner:profiles!farms_owner_id_fkey(full_name, phone_number)
        `)
        .eq('tenant_id', tenant?.id)
        .eq('status', 'active')
        .order('name');

      if (farmsError) throw farmsError;
      setFarms(farmsData || []);

      // Load agronomists and inspectors
      const { data: agronomistsData, error: agronomistsError } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone_number, metadata')
        .eq('tenant_id', tenant?.id)
        .in('role', ['agronomist', 'inspector', 'admin'])
        .order('full_name');

      if (agronomistsError) throw agronomistsError;
      setAgronomists(agronomistsData || []);

    } catch (err) {
      console.error('Error loading scheduling data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date: string) => {
    const slots: TimeSlot[] = [];
    const selectedDate = new Date(date);
    
    // Generate slots from 8 AM to 6 PM, 2-hour intervals
    for (let hour = 8; hour <= 18; hour += 2) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hour, 0, 0, 0);
      
      // Check if slot is available for each agronomist
      for (const agronomist of agronomists) {
        const existingVisit = visits.find(visit => {
          const visitDate = new Date(visit.scheduled_date);
          return visit.visitor_id === agronomist.id &&
                 visitDate.toDateString() === selectedDate.toDateString() &&
                 visitDate.getHours() === hour;
        });

        slots.push({
          date,
          time,
          available: !existingVisit && slotDateTime > new Date(),
          visitor_id: agronomist.id
        });
      }
    }
    
    setTimeSlots(slots);
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scheduledDateTime = new Date(`${newVisit.scheduled_date}T${newVisit.scheduled_time}`);
      
      // Create the visit
      const { data: visit, error: visitError } = await supabase
        .from('farm_visits')
        .insert({
          tenant_id: tenant?.id,
          farm_id: newVisit.farm_id,
          visitor_id: newVisit.visitor_id,
          visit_type: newVisit.visit_type,
          scheduled_date: scheduledDateTime.toISOString(),
          duration_minutes: newVisit.duration_minutes,
          status: 'scheduled',
          priority: newVisit.priority,
          description: newVisit.description,
          checklist: newVisit.checklist.map((item, index) => ({
            id: `item_${index}`,
            item,
            completed: false
          }))
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // Send SMS notification to farmer
      const farm = farms.find(f => f.id === newVisit.farm_id);
      if (farm?.owner?.phone_number) {
        await sendVisitNotification(farm, visit, 'scheduled');
      }

      // Reset form and reload data
      setNewVisit({
        farm_id: '',
        visitor_id: '',
        visit_type: 'advisory',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 120,
        priority: 'medium',
        description: '',
        checklist: []
      });
      
      setShowNewVisitForm(false);
      loadInitialData();

    } catch (err) {
      console.error('Error scheduling visit:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule visit');
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, status: FarmVisit['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('farm_visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(visits.map(visit => 
        visit.id === visitId 
          ? { ...visit, status, completed_at: updateData.completed_at }
          : visit
      ));

      // Send notification for status change
      const visit = visits.find(v => v.id === visitId);
      if (visit?.farm) {
        await sendVisitNotification(visit.farm, visit, status);
      }

    } catch (err) {
      console.error('Error updating visit status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visit');
    }
  };

  const sendVisitNotification = async (farm: any, visit: any, status: string) => {
    try {
      // Create notification record
      await supabase
        .from('notifications')
        .insert({
          tenant_id: tenant?.id,
          user_id: farm.owner_id,
          title: `Farm Visit ${status}`,
          message: getNotificationMessage(visit, status),
          type: 'farm_visit',
          metadata: {
            visit_id: visit.id,
            visit_type: visit.visit_type,
            status,
            scheduled_date: visit.scheduled_date
          }
        });

      // TODO: Send SMS notification using Africa's Talking or similar service
      console.log('SMS notification sent to:', farm.owner.phone_number);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getNotificationMessage = (visit: any, status: string) => {
    const date = new Date(visit.scheduled_date).toLocaleDateString();
    const time = new Date(visit.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    switch (status) {
      case 'scheduled':
        return `Your farm visit has been scheduled for ${date} at ${time}. Our ${visit.visitor?.role} will conduct a ${visit.visit_type} visit.`;
      case 'completed':
        return `Your farm visit on ${date} has been completed. You will receive a detailed report shortly.`;
      case 'cancelled':
        return `Your farm visit scheduled for ${date} at ${time} has been cancelled. We will reschedule soon.`;
      case 'rescheduled':
        return `Your farm visit has been rescheduled to ${date} at ${time}.`;
      default:
        return `Your farm visit status has been updated to ${status}.`;
    }
  };

  const getVisitTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      inspection: '🔍',
      advisory: '👨‍🌾',
      training: '📚',
      maintenance: '🔧',
      emergency: '🚨'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'text-blue-400',
      in_progress: 'text-yellow-400',
      completed: 'text-green-400',
      cancelled: 'text-red-400',
      rescheduled: 'text-orange-400'
    };
    return colors[status] || 'text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || 'text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading schedule...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
      {/* Header */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Farm Visit Scheduler</h1>
            <p className="text-white/80">Manage agronomist and inspector visits</p>
          </div>
          
          {hasPermission('manage_visits') && (
            <button
              onClick={() => setShowNewVisitForm(true)}
              className="glass-button glass-button-primary"
            >
              📅 Schedule Visit
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">📅</div>
            <div className="text-blue-primary text-xs font-medium">TODAY</div>
          </div>
          <div className="text-xl font-bold text-white">
            {visits.filter(v => 
              new Date(v.scheduled_date).toDateString() === new Date().toDateString()
            ).length}
          </div>
          <div className="text-white/60 text-sm">Visits today</div>
        </div>

        <div className="glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">⏳</div>
            <div className="text-yellow-primary text-xs font-medium">PENDING</div>
          </div>
          <div className="text-xl font-bold text-white">
            {visits.filter(v => v.status === 'scheduled').length}
          </div>
          <div className="text-white/60 text-sm">Scheduled</div>
        </div>

        <div className="glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">✅</div>
            <div className="text-green-primary text-xs font-medium">DONE</div>
          </div>
          <div className="text-xl font-bold text-white">
            {visits.filter(v => v.status === 'completed').length}
          </div>
          <div className="text-white/60 text-sm">Completed</div>
        </div>

        <div className="glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">🚨</div>
            <div className="text-red-primary text-xs font-medium">URGENT</div>
          </div>
          <div className="text-xl font-bold text-white">
            {visits.filter(v => v.priority === 'urgent').length}
          </div>
          <div className="text-white/60 text-sm">Urgent visits</div>
        </div>
      </div>

      {/* Visits List */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">This Week's Visits</h2>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input text-sm"
            />
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="text-center text-white/80 py-8">
            <div className="text-4xl mb-4">📅</div>
            <div>No visits scheduled</div>
            <div className="text-sm mt-2">Schedule your first farm visit</div>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="glass-agricultural p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getVisitTypeIcon(visit.visit_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">
                          {visit.farm?.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(visit.priority)}`}>
                          {visit.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-white/80 text-sm mb-2">
                        <div>👨‍🌾 {visit.visitor?.full_name} ({visit.visitor?.role})</div>
                        <div>📍 {visit.farm?.location}</div>
                        <div>📞 {visit.farm?.owner?.phone_number}</div>
                        <div>📝 {visit.description}</div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>
                          📅 {new Date(visit.scheduled_date).toLocaleDateString()}
                        </span>
                        <span>
                          ⏰ {new Date(visit.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span>
                          ⏱️ {visit.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(visit.status)}`}>
                      {visit.status.replace('_', ' ').toUpperCase()}
                    </div>
                    
                    {hasPermission('manage_visits') && visit.status === 'scheduled' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateVisitStatus(visit.id, 'in_progress')}
                          className="glass-button text-xs"
                          title="Start Visit"
                        >
                          ▶️
                        </button>
                        <button
                          onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}
                          className="glass-button text-xs"
                          title="Mark Complete"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleUpdateVisitStatus(visit.id, 'cancelled')}
                          className="glass-button text-xs"
                          title="Cancel"
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Visit Form Modal */}
      {showNewVisitForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Schedule New Visit</h2>
              <button 
                onClick={() => setShowNewVisitForm(false)}
                className="glass-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Farm *
                  </label>
                  <select
                    value={newVisit.farm_id}
                    onChange={(e) => setNewVisit(prev => ({...prev, farm_id: e.target.value}))}
                    className="glass-input w-full"
                    required
                  >
                    <option value="">Select farm</option>
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name} - {farm.owner?.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Visitor *
                  </label>
                  <select
                    value={newVisit.visitor_id}
                    onChange={(e) => setNewVisit(prev => ({...prev, visitor_id: e.target.value}))}
                    className="glass-input w-full"
                    required
                  >
                    <option value="">Select visitor</option>
                    {agronomists.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.full_name} ({person.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Visit Type *
                  </label>
                  <select
                    value={newVisit.visit_type}
                    onChange={(e) => setNewVisit(prev => ({...prev, visit_type: e.target.value as any}))}
                    className="glass-input w-full"
                    required
                  >
                    <option value="advisory">Advisory</option>
                    <option value="inspection">Inspection</option>
                    <option value="training">Training</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Priority *
                  </label>
                  <select
                    value={newVisit.priority}
                    onChange={(e) => setNewVisit(prev => ({...prev, priority: e.target.value as any}))}
                    className="glass-input w-full"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="480"
                    step="30"
                    value={newVisit.duration_minutes}
                    onChange={(e) => setNewVisit(prev => ({...prev, duration_minutes: parseInt(e.target.value) || 120}))}
                    className="glass-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newVisit.scheduled_date}
                    onChange={(e) => setNewVisit(prev => ({...prev, scheduled_date: e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                    className="glass-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Time *
                  </label>
                  <select
                    value={newVisit.scheduled_time}
                    onChange={(e) => setNewVisit(prev => ({...prev, scheduled_time: e.target.value}))}
                    className="glass-input w-full"
                    required
                  >
                    <option value="">Select time</option>
                    {Array.from({length: 6}, (_, i) => {
                      const hour = 8 + (i * 2);
                      const time = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={newVisit.description}
                  onChange={(e) => setNewVisit(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the purpose and goals of this visit..."
                  className="glass-input w-full"
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowNewVisitForm(false)}
                  className="glass-button flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button glass-button-primary flex-1"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 glass-danger p-4 rounded-lg max-w-sm">
          <p className="text-white text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-white/60 hover:text-white text-xs mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default FarmVisitScheduler;