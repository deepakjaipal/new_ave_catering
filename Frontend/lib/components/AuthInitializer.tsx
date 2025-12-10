'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { loadUserAsync } from '@/lib/store/slices/authSlice';
import { setAuthToken } from '@/lib/api/services/authService';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Set the token in the API headers
      setAuthToken(token);
      // Load user data
      dispatch(loadUserAsync());
    }
  }, [dispatch]);

  return null;
}
