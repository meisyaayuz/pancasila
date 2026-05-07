import api from './api';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'counselor';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ContactRequest {
  requestedAt: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  counselorName: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentClass: string;
  studentInitial: string;
  content: string;
  categories: string[];
  mood: string;
  timestamp: string;
  date: string;
  time: string;
  status: 'new' | 'in-progress' | 'resolved';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative';
  aiScore: number;
  keywords: string[];
  location?: string;
  witness?: boolean;
  notes?: string;
  contactRequest?: ContactRequest;
  messages?: ChatMessage[];
}

export const getReports = async (): Promise<Report[]> => {
  try {
    const response = await api.get('/reports');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const getReportById = async (id: string): Promise<Report | null> => {
  try {
    const response = await api.get(`/reports/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching report detail:', error);
    throw error;
  }
};

export const getReportsByStudentId = async (studentId: string): Promise<Report[]> => {
  try {
    const response = await api.get(`/students/${studentId}/reports`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching student reports:', error);
    throw error;
  }
};

export const createReport = async (
  content: string,
  categories: string[],
  mood: string,
  studentName: string,
  studentClass: string,
  studentId: string
): Promise<Report> => {
  try {
    const payload = {
      content,
      categories,
      mood,
      studentName,
      studentClass,
      studentId
    };
    const response = await api.post('/reports', payload);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const updateReportStatus = async (id: string, status: Report['status']): Promise<Report> => {
  try {
    const response = await api.put(`/reports/${id}/status`, { status });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

export const updateReportNotes = async (id: string, notes: string): Promise<Report> => {
  try {
    const response = await api.put(`/reports/${id}/notes`, { notes });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating report notes:', error);
    throw error;
  }
};

export const createContactRequest = async (
  reportId: string,
  scheduledDate: string,
  scheduledTime: string,
  location: string,
  message: string,
  counselorName: string
): Promise<void> => {
  try {
    const payload = { scheduledDate, scheduledTime, location, message, counselorName };
    await api.post(`/reports/${reportId}/contact-request`, payload);
  } catch (error) {
    console.error('Error creating contact request:', error);
    throw error;
  }
};

export const updateContactRequestStatus = async (
  reportId: string,
  status: 'pending' | 'accepted' | 'declined'
): Promise<void> => {
  try {
    await api.put(`/reports/${reportId}/contact-request/status`, { status });
  } catch (error) {
    console.error('Error updating contact request status:', error);
    throw error;
  }
};

export const getPendingContactRequestsCount = async (studentId: string): Promise<number> => {
  try {
    const response = await api.get(`/students/${studentId}/contact-requests/pending/count`);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error getting pending requests count:', error);
    return 0;
  }
};

export const sendMessage = async (
  reportId: string,
  senderId: string,
  senderName: string,
  senderRole: 'student' | 'counselor',
  message: string
): Promise<void> => {
  try {
    await api.post(`/reports/${reportId}/messages`, { senderId, senderName, senderRole, message });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (reportId: string, userId: string): Promise<void> => {
  try {
    await api.put(`/reports/${reportId}/messages/read`, { userId });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const getUnreadMessagesCount = async (userId: string, userRole: 'student' | 'counselor'): Promise<number> => {
  try {
    const response = await api.get(`/users/${userId}/messages/unread-count?role=${userRole}`);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
};

export const getUnreadMessagesCountForReport = async (reportId: string, userId: string): Promise<number> => {
  try {
    const response = await api.get(`/reports/${reportId}/messages/unread-count?userId=${userId}`);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error getting unread messages for report:', error);
    return 0;
  }
};