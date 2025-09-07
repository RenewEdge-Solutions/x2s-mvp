import React, { useState } from 'react';

// Mock data for users and farms
const mockUsers = [
  {
    id: 1,
    name: 'Alice Farmer',
    username: 'alice',
    farm: 'Green Valley',
    location: 'North District',
    status: 'ok',
    plants: 1200,
    lastInspection: '2025-08-01',
    critical: false,
  },
  {
    id: 2,
    name: 'Bob Grower',
    username: 'bob',
    farm: 'Sunrise Fields',
    location: 'East District',
    status: 'critical',
    plants: 800,
    lastInspection: '2025-07-15',
    critical: true,
  },
  {
    id: 3,
    name: 'Carla Hemp',
    username: 'carla',
    farm: 'Hempstead',
    location: 'West District',
    status: 'ok',
    plants: 950,
    lastInspection: '2025-08-10',
    critical: false,
  },
  {
    id: 4,
    name: 'David Fields',
    username: 'david',
    farm: 'Riverbend',
    location: 'South District',
    status: 'critical',
    plants: 400,
    lastInspection: '2025-06-30',
    critical: true,
  },
];

export default function AuditorUsers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.farm.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'critical' ? user.critical : !user.critical);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Farmer Users Overview</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, username, or farm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-72"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-48"
        >
          <option value="all">All Users</option>
          <option value="critical">Critical Only</option>
          <option value="ok">Non-critical Only</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Farm</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Plants</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Last Inspection</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className={
                    user.critical
                      ? 'bg-red-50 border-l-4 border-red-500'
                      : ''
                  }
                >
                  <td className="px-4 py-2 font-medium">{user.name}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.farm}</td>
                  <td className="px-4 py-2">{user.location}</td>
                  <td className="px-4 py-2">{user.plants}</td>
                  <td className="px-4 py-2">{user.lastInspection}</td>
                  <td className="px-4 py-2">
                    {user.critical ? (
                      <span className="inline-block px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded">Critical</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">OK</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
