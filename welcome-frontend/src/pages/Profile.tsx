import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500">Name</div>
          <div className="text-gray-900">{user.firstName} {user.lastName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Username</div>
          <div className="text-gray-900">{user.username}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Role</div>
          <div className="text-gray-900">{user.role}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Email</div>
          <div className="text-gray-900">{user.email}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Phone</div>
          <div className="text-gray-900">{user.phone}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs text-gray-500">Address</div>
          <div className="text-gray-900">{user.address}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs text-gray-500">Subscribed Modules</div>
          <div className="text-gray-900">
            {user.modules?.length ? user.modules.join(', ') : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
