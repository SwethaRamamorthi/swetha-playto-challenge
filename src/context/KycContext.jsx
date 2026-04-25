import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/mockApi';

export const KycContext = createContext(null);

export const KycProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name: string, role: 'merchant' | 'reviewer' }
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('swetha_kyc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (role) => {
    const newUser = { name: 'Swetha Ramamoorthi', role };
    setUser(newUser);
    localStorage.setItem('swetha_kyc_user', JSON.stringify(newUser));
    showToast(`Welcome back, Swetha! Logged in as ${role}`, 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swetha_kyc_user');
    showToast('Logged out successfully', 'info');
  };

  const addNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message, read: false }, ...prev].slice(0, 10));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.fetchSubmissions(user);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (data) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.submitKyc(data, user);
      if (!data.isDraft) {
         showToast(`Application ${response.id} submitted!`, 'success');
         addNotification(`Application ${response.id} submitted for review.`);
      } else {
         showToast(`Draft saved successfully`, 'success');
      }
      return response;
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actionOnSubmission = async (id, status, reason = "") => {
    if (!user) return;
    setLoading(true);
    try {
      await api.updateSubmissionStatus(id, status, user, reason);
      showToast(`Submission ${id} marked as ${status.replace('_', ' ')}`, 'success');
      addNotification(`Submission ${id} marked as ${status.replace('_', ' ')}`);
      await loadSubmissions(); 
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KycContext.Provider value={{
      user,
      login,
      logout,
      submissions,
      loading,
      notifications,
      toasts,
      removeToast,
      loadSubmissions,
      submitApplication,
      actionOnSubmission
    }}>
      {children}
    </KycContext.Provider>
  );
};

export const useKyc = () => useContext(KycContext);
