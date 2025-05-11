import { useState, useEffect } from 'react';
import { Practitioner } from '@/lib/types';

type UsePractitionersProps = {
  specialization?: string;
  location?: string;
};

// Helper function to get authentication headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Helper function to check if user is authenticated
function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function usePractitioners(props?: UsePractitionersProps) {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPractitioners() {
      try {
        setLoading(true);
        setError(null);

        // Build query string from props
        const params = new URLSearchParams();
        if (props?.specialization) {
          params.append('specialization', props.specialization);
        }
        if (props?.location) {
          params.append('location', props.location);
        }

        const queryString = params.toString();
        const url = `/api/practitioners${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch practitioners');
        }

        const data = await response.json();
        setPractitioners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPractitioners();
  }, [props?.specialization, props?.location]);

  return { practitioners, loading, error };
}

interface BookConsultationProps {
  practitionerId: string;
  date: string;
  time: string;
  mode: 'online' | 'in-person';
}

interface ConsultationResponse {
  id: string;
  practitionerName: string;
  specialization: string;
  date: string;
  time: string;
  mode: 'online' | 'in-person';
}

export async function bookConsultation(props: BookConsultationProps): Promise<ConsultationResponse> {
  if (!isAuthenticated()) {
    throw new Error('Please sign in to book an appointment');
  }

  const response = await fetch('/api/consultations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(props)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      throw new Error('Please sign in to book an appointment');
    }
    throw new Error(error.error || 'Failed to book consultation');
  }

  const data = await response.json();
  return data.consultation;
}

export async function cancelConsultation(consultationId: string): Promise<void> {
  if (!isAuthenticated()) {
    throw new Error('Please sign in to cancel the appointment');
  }

  const response = await fetch(`/api/consultations?id=${consultationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      throw new Error('Please sign in to cancel the appointment');
    }
    throw new Error(error.error || 'Failed to cancel consultation');
  }
}

interface RescheduleConsultationProps {
  consultationId: string;
  date: string;
  time: string;
}

export async function rescheduleConsultation(props: RescheduleConsultationProps): Promise<void> {
  if (!isAuthenticated()) {
    throw new Error('Please sign in to reschedule the appointment');
  }

  const { consultationId, ...updates } = props;

  const response = await fetch(`/api/consultations?id=${consultationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      throw new Error('Please sign in to reschedule the appointment');
    }
    throw new Error(error.error || 'Failed to reschedule consultation');
  }
}

export function useConsultations(practitionerId?: string) {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsultations() {
      try {
        if (!isAuthenticated()) {
          throw new Error('Please sign in to view consultations');
        }

        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (practitionerId) {
          params.append('practitionerId', practitionerId);
        }

        const response = await fetch(`/api/consultations?${params.toString()}`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to view consultations');
          }
          throw new Error('Failed to fetch consultations');
        }

        const data = await response.json();
        setConsultations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConsultations();
  }, [practitionerId]);

  return { consultations, loading, error };
}
