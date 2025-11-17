import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const API_BASE = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVendors: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    totalMeals: 0
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        pendingVendorsCount={stats.pendingVendors}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobileView={isMobileView}
      />
      <main className={`flex-1 transition-all duration-300 ${isMobileView ? 'ml-0' : ''}`}>
        <div className="p-8">
          <Outlet context={{ stats, fetchStats }} />
        </div>
      </main>
    </div>
  );
}
