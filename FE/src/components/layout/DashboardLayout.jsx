import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav>
          <ul>
            <li><a href="/admin" className="block py-2 px-4 hover:bg-gray-700">Dashboard</a></li>
            <li><a href="/admin/properties" className="block py-2 px-4 hover:bg-gray-700">Properties</a></li>
            <li><a href="/admin/users" className="block py-2 px-4 hover:bg-gray-700">Users</a></li>
            <li><a href="/admin/transactions" className="block py-2 px-4 hover:bg-gray-700">Transactions</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;