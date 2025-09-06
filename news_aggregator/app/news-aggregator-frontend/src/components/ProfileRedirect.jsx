import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileRedirect = ({ children }) => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  // If user is not authenticated, let the protected route handle it
  if (!isAuthenticated) {
    return children;
  }

  // If no userId in params or userId matches current user, redirect to myprofile
  const currentUserId = currentUser?.id || currentUser?._id;
  if (!userId || userId === currentUserId) {
    return <Navigate to="/myprofile" replace />;
  }

  // Otherwise, show the profile for the other user
  return children;
};

export default ProfileRedirect;
