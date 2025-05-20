import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;