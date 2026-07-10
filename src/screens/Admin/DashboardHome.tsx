// @ts-nocheck
import { useState, useMemo, useEffect, memo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import StatCard from './components/StatCard'
import './admin.css'
import { useAuthStore } from '../../store/authStore'
import { LogOut, Users, Package, ShoppingBag, FileText, ChevronDown, BarChart2, TrendingUp, PieChart, Target, ChevronLeft, ChevronRight, Bell, PhoneCall } from 'lucide-react'
import TopBar from './components/TopBar'
import { FirestoreService } from '../../services/firestore.service'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

const INITIAL_ANALYTICS_DATA = {
  user: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Active Users', data: [65, 78, 72, 85, 95, 110, 105, 98, 115, 125, 140, 155], color: '#6c9cff', percentage: 57, trend: '+3.34%' },
        { label: 'Inactive Users', data: [20, 15, 18, 12, 8, 5, 10, 12, 15, 8, 10, 5], color: '#94a3b8', percentage: 21, trend: '-1.10%' },
        { label: 'Logout Users', data: [40, 35, 45, 30, 25, 20, 25, 30, 35, 28, 22, 18], color: '#f87171', percentage: 22, trend: '+15.75%' }
      ]
    },
    yearly: {
      labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        { label: 'Active Users', data: [200, 300, 450, 600, 800, 1200, 1800, 2400, 3200, 4500], color: '#6c9cff', percentage: 76, trend: '+5.20%' },
        { label: 'Inactive Users', data: [50, 60, 40, 30, 50, 80, 100, 120, 150, 100], color: '#94a3b8', percentage: 12, trend: '-2.40%' },
        { label: 'Logout Users', data: [100, 120, 150, 180, 200, 250, 300, 400, 350, 300], color: '#f87171', percentage: 12, trend: '+8.10%' }
      ]
    }
  },
  product: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Active Products', data: [30, 35, 40, 42, 45, 48, 50, 55, 60, 65, 70, 75], color: '#4ce1b1', percentage: 65, trend: '+2.10%' },
        { label: 'Out of Stock', data: [10, 12, 8, 15, 5, 3, 5, 8, 10, 5, 2, 4], color: '#ffd68a', percentage: 15, trend: '-0.50%' },
        { label: 'New Arrivals', data: [15, 18, 22, 20, 25, 30, 28, 32, 35, 40, 42, 45], color: '#6c9cff', percentage: 20, trend: '+1.20%' }
      ]
    },
    yearly: {
      labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        { label: 'Active Products', data: [80, 120, 180, 250, 340, 450, 580, 720, 880, 1100], color: '#4ce1b1', percentage: 72, trend: '+4.50%' },
        { label: 'Out of Stock', data: [20, 30, 25, 40, 50, 60, 40, 30, 20, 15], color: '#ffd68a', percentage: 10, trend: '-1.80%' },
        { label: 'New Arrivals', data: [40, 60, 80, 120, 180, 250, 320, 400, 480, 600], color: '#6c9cff', percentage: 18, trend: '+3.40%' }
      ]
    }
  },
  order: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Active', data: [120, 140, 130, 160, 180, 210, 200, 190, 220, 240, 260, 280], color: '#6c9cff', percentage: 40, trend: '+1.10%' },
        { label: 'In Progress', data: [80, 95, 110, 105, 130, 150, 145, 160, 175, 180, 200, 220], color: '#ffd68a', percentage: 30, trend: '+0.50%' },
        { label: 'Completed', data: [40, 55, 65, 80, 95, 120, 115, 130, 145, 160, 175, 200], color: '#4ce1b1', percentage: 20, trend: '+2.30%' },
        { label: 'Rejected', data: [10, 15, 8, 12, 5, 7, 10, 12, 15, 8, 10, 5], color: '#f87171', percentage: 6, trend: '-0.20%' },
        { label: 'Failed', data: [5, 8, 4, 6, 3, 2, 4, 5, 6, 3, 2, 1], color: '#ff4d4d', percentage: 4, trend: '-0.10%' }
      ]
    },
    yearly: {
      labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        { label: 'Active', data: [400, 600, 900, 1400, 2100, 3200, 4800, 6500, 8800, 12000], color: '#6c9cff', percentage: 45, trend: '+6.10%' },
        { label: 'In Progress', data: [300, 450, 700, 1000, 1400, 1900, 2600, 3500, 4800, 6500], color: '#ffd68a', percentage: 25, trend: '+3.20%' },
        { label: 'Completed', data: [200, 350, 550, 850, 1300, 1800, 2400, 3200, 4500, 6000], color: '#4ce1b1', percentage: 20, trend: '+5.40%' },
        { label: 'Rejected', data: [50, 80, 120, 150, 180, 140, 200, 250, 300, 240], color: '#f87171', percentage: 6, trend: '-1.10%' },
        { label: 'Failed', data: [20, 40, 60, 90, 110, 80, 100, 130, 150, 120], color: '#ff4d4d', percentage: 4, trend: '-0.50%' }
      ]
    }
  }
};

const processFirestoreData = (docs, type, currentYear) => {
  const startYear = currentYear - 5;
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    counts: {}
  };
  const yearlyData = {
    labels: Array.from({length: 10}, (_, i) => (startYear + i).toString()),
    counts: {}
  };

  if (type === 'order') {
    monthlyData.counts = { 'Active': Array(12).fill(0), 'In Progress': Array(12).fill(0), 'Completed': Array(12).fill(0), 'Rejected': Array(12).fill(0), 'Failed': Array(12).fill(0) };
    yearlyData.counts = { 'Active': Array(10).fill(0), 'In Progress': Array(10).fill(0), 'Completed': Array(10).fill(0), 'Rejected': Array(10).fill(0), 'Failed': Array(10).fill(0) };
  } else if (type === 'product') {
    monthlyData.counts = { 'Active Products': Array(12).fill(0), 'Out of Stock': Array(12).fill(0), 'New Arrivals': Array(12).fill(0) };
    yearlyData.counts = { 'Active Products': Array(10).fill(0), 'Out of Stock': Array(10).fill(0), 'New Arrivals': Array(10).fill(0) };
  } else if (type === 'user') {
    monthlyData.counts = { 'Active Users': Array(12).fill(0), 'Inactive Users': Array(12).fill(0), 'Logout Users': Array(12).fill(0) };
    yearlyData.counts = { 'Active Users': Array(10).fill(0), 'Inactive Users': Array(10).fill(0), 'Logout Users': Array(10).fill(0) };
  }

  docs.forEach(doc => {
    const data = doc.data();
    let dateStr = data.createdAt || data.joined;
    if (!dateStr) return;
    
    let d;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        d = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date();
    } else {
        d = new Date(dateStr);
    }
    
    if (isNaN(d.getTime())) return;
    
    const docYear = d.getFullYear();
    const docMonth = d.getMonth();
    
    let category = '';
    
    if (type === 'order') {
       if (data.status === 'Pending') category = 'In Progress';
       else if (['Processing', 'Shipped'].includes(data.status)) category = 'Active';
       else if (data.status === 'Delivered') category = 'Completed';
       else category = 'Failed';
    } else if (type === 'product') {
       category = data.isActive ? 'Active Products' : 'Out of Stock';
       if ((new Date().getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000) {
           if (docYear === currentYear) monthlyData.counts['New Arrivals'][docMonth]++;
           const yIdx = docYear - startYear;
           if (yIdx >= 0 && yIdx < 10) yearlyData.counts['New Arrivals'][yIdx]++;
       }
    } else if (type === 'user') {
       category = 'Active Users';
    }

    if (category) {
        if (docYear === currentYear) monthlyData.counts[category][docMonth]++;
        const yIdx = docYear - startYear;
        if (yIdx >= 0 && yIdx < 10) yearlyData.counts[category][yIdx]++;
    }
  });

  const createDatasets = (countsObj, baseDatasets) => {
    return baseDatasets.map(ds => {
      const newData = countsObj[ds.label] || Array(ds.data.length).fill(0);
      const total = newData.reduce((a,b)=>a+b, 0);
      return {
        ...ds,
        data: newData,
        percentage: total > 0 ? Math.min(100, Math.round(total * 10)) : 0,
        trend: total > 0 ? '+5.0%' : '0%'
      };
    });
  };

  return {
    monthly: { labels: monthlyData.labels, datasets: createDatasets(monthlyData.counts, INITIAL_ANALYTICS_DATA[type].monthly.datasets) },
    yearly: { labels: yearlyData.labels, datasets: createDatasets(yearlyData.counts, INITIAL_ANALYTICS_DATA[type].yearly.datasets) }
  };
};

const AnalyticsChart = memo(({ data }) => {
  const [activeModule, setActiveModule] = useState('order');
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartType, setChartType] = useState('area'); // 'area', 'pie', 'gauge', 'bar'
  const [hiddenDatasets, setHiddenDatasets] = useState(new Set());
  const [startIndex, setStartIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleCount = isMobile ? 4 : 6;

  const rawData = data[activeModule][timeRange];

  // Pagination logic
  const labels = rawData.labels.slice(startIndex, startIndex + visibleCount);
  const datasets = rawData.datasets.map(ds => ({
    ...ds,
    data: ds.data.slice(startIndex, startIndex + visibleCount)
  }));
  const currentData = { labels, datasets };

  const [selectedYear, setSelectedYear] = useState(2024);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    } else if (timeRange === 'monthly') {
      setSelectedYear(prev => prev - 1);
      setStartIndex(rawData.labels.length - visibleCount);
    }
  };

  const handleNext = () => {
    if (startIndex < rawData.labels.length - visibleCount) {
      setStartIndex(prev => prev + 1);
    } else if (timeRange === 'monthly') {
      setSelectedYear(prev => prev + 1);
      setStartIndex(0);
    }
  };

  const toggleDataset = (label) => {
    const newHidden = new Set(hiddenDatasets);
    if (newHidden.has(label)) {
      newHidden.delete(label);
    } else {
      if (newHidden.size < currentData.datasets.length - 1) {
        newHidden.add(label);
      }
    }
    setHiddenDatasets(newHidden);
  };

  const getPathData = (data, width, height, max, paddingX = 0) => {
    const drawWidth = width - (paddingX * 2);
    const points = data.map((val, i) => ({
      x: paddingX + (i / (data.length - 1)) * drawWidth,
      y: height - (val / max) * height
    }));

    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const renderGauge = (ds, size = 120) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ds.percentage / 100) * circumference;

    return (
      <div key={ds.label} className="gauge-item">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ds.color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="gauge-progress"
          />
          <text x="50%" y="45%" textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="bold">{ds.percentage}%</text>
          <text x="50%" y="65%" textAnchor="middle" fill={ds.trend.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)'} fontSize="10">{ds.trend}</text>
        </svg>
        <span className="gauge-label">{ds.label}</span>
      </div>
    );
  };

  const renderPie = () => {
    const size = 200;
    const radius = 80;
    const strokeWidth = 24;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;
    const activeDatasets = currentData.datasets.filter(ds => !hiddenDatasets.has(ds.label));

    return (
      <div className="pie-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {activeDatasets.map((ds, i) => {
            const dashOffset = (ds.percentage / 100) * circumference;
            const strokeDashOffset = circumference - currentOffset;
            currentOffset += dashOffset;
            return (
              <circle
                key={ds.label} cx={center} cy={center} r={radius} fill="none" stroke={ds.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashOffset} ${circumference - dashOffset}`}
                strokeDashoffset={-strokeDashOffset + dashOffset}
                className="pie-segment"
              />
            );
          })}
          <text x="50%" y="48%" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="bold">100%</text>
          <text x="50%" y="58%" textAnchor="middle" fill="var(--text-muted)" fontSize="10" textTransform="uppercase">Overview</text>
        </svg>
        <div className="pie-legend">
          {currentData.datasets.map(ds => (
            <div key={ds.label} className="pie-legend-item">
              <span className="dot" style={{ background: ds.color }} />
              <span className="label">{ds.label}</span>
              <span className="value">{ds.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    const width = 600;
    const height = 220;
    const chartHeight = 180;
    const paddingX = 40; // padding to prevent text clipping
    const drawWidth = width - (paddingX * 2);
    const max = Math.max(...currentData.datasets.flatMap(d => d.data)) * 1.1;

    if (chartType === 'gauge') {
      return <div className="gauges-grid">{currentData.datasets.map(ds => !hiddenDatasets.has(ds.label) && renderGauge(ds))}</div>;
    }

    if (chartType === 'pie') {
      return renderPie();
    }

    if (chartType === 'bar') {
      const barWidth = (drawWidth / currentData.labels.length) * 0.6;
      const groupWidth = barWidth / currentData.datasets.filter(ds => !hiddenDatasets.has(ds.label)).length;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="responsive-svg">
          {currentData.labels.map((label, i) => {
            let offset = 0;
            const xBase = paddingX + (i / currentData.labels.length) * drawWidth + (drawWidth / currentData.labels.length / 2);
            return (
              <g key={`bar-group-${i}`}>
                {currentData.datasets.map((ds, dsIdx) => {
                  if (hiddenDatasets.has(ds.label)) return null;
                  const barHeight = (ds.data[i] / max) * chartHeight;
                  const x = xBase - (barWidth / 2) + (offset * groupWidth);
                  offset++;
                  return (
                    <rect key={`${dsIdx}-${i}`} x={x} y={chartHeight - barHeight} width={groupWidth - 2} height={barHeight} fill={ds.color} rx="4" className="chart-bar" />
                  );
                })}
                <text x={xBase} y={chartHeight + 25} textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontWeight="500">{label}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="responsive-svg">
        <defs>
          {currentData.datasets.map((ds, i) => (
            <linearGradient key={`grad-${i}`} id={`grad-${activeModule}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ds.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {currentData.datasets.map((ds, i) => {
          if (hiddenDatasets.has(ds.label)) return null;
          const pathData = getPathData(ds.data, width, chartHeight, max, paddingX);
          return (
            <g key={ds.label}>
              <path d={`${pathData} L ${width - paddingX} ${chartHeight} L ${paddingX} ${chartHeight} Z`} fill={`url(#grad-${activeModule}-${i})`} className="chart-area" />
              <path d={pathData} fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" className="chart-line-smooth" />
            </g>
          );
        })}
        {currentData.labels.map((label, i) => (
          <text key={i} x={paddingX + (i / (currentData.labels.length - 1)) * drawWidth} y={chartHeight + 25} textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontWeight="500">{label}</text>
        ))}
      </svg>
    );
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="module-selector">
          <button className={`module-btn ${activeModule === 'user' ? 'active' : ''}`} onClick={() => setActiveModule('user')}>
            <Users size={16} /> Users
          </button>
          <button className={`module-btn ${activeModule === 'product' ? 'active' : ''}`} onClick={() => setActiveModule('product')}>
            <Package size={16} /> Products
          </button>
          <button className={`module-btn ${activeModule === 'order' ? 'active' : ''}`} onClick={() => setActiveModule('order')}>
            <ShoppingBag size={16} /> Orders
          </button>
        </div>

        <div className="analytics-controls-row">
          <div className="chart-type-selector">
            <button className={chartType === 'area' ? 'active' : ''} onClick={() => setChartType('area')} title="Area Chart"><TrendingUp size={16} /></button>
            <button className={chartType === 'gauge' ? 'active' : ''} onClick={() => setChartType('gauge')} title="Gauge Chart"><Target size={16} /></button>
            <button className={chartType === 'pie' ? 'active' : ''} onClick={() => setChartType('pie')} title="Pie Chart"><PieChart size={16} /></button>
            <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')} title="Bar Chart"><BarChart2 size={16} /></button>
          </div>

          <div className="time-selector">
            <select value={timeRange} onChange={(e) => {
              setTimeRange(e.target.value);
              setStartIndex(0);
            }}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-top-bar">
          <div className="chart-legend">
            {currentData.datasets.map(ds => (
              <div key={ds.label} className={`legend-item ${hiddenDatasets.has(ds.label) ? 'hidden' : ''}`} onClick={() => toggleDataset(ds.label)}>
                <span className="legend-dot" style={{ background: ds.color }} />
                {ds.label}
              </div>
            ))}
          </div>
          {timeRange === 'monthly' && (
            <div className="chart-year-indicator">
              {selectedYear}
            </div>
          )}
        </div>

        <div className="svg-container">
          {chartType !== 'pie' && chartType !== 'gauge' && (
            <button className="nav-arrow left" onClick={handlePrev}><ChevronLeft size={20} /></button>
          )}

          {renderChart()}

          {chartType !== 'pie' && chartType !== 'gauge' && (
            <button className="nav-arrow right" onClick={handleNext}><ChevronRight size={20} /></button>
          )}
        </div>
      </div>
    </div>
  );
});

const navItems = [
  { label: 'Dash Board', id: 'admin-dashboard', active: true },
  { label: 'Approval & Control', id: 'approval' },
  { label: 'Manage Users', id: 'users' },
  { label: 'Manage Advocates', id: 'advocates' },
  { label: 'Reports & Analytics', id: 'reports' },
  { label: 'Feed Backs', id: 'feedbacks' },
]

export default function DashboardHome() {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>()
  const sidebarOpen = context?.sidebarOpen || false
  const setSidebarOpen = context?.setSidebarOpen || (() => {})
  
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState([
    { title: "Total Revenue", value: "₹...", detail: "Calculating", badge: "" },
    { title: "Total Orders", value: "...", detail: "Loading", badge: "" },
    { title: "Active Users", value: "...", detail: "Loading", badge: "" },
    { title: "Active Products", value: "...", detail: "Loading", badge: "" }
  ]);
  const [pulse, setPulse] = useState({ pendingOrders: "...", activeProducts: "..." });
  const [auditFeed, setAuditFeed] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState(INITIAL_ANALYTICS_DATA);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    // Listen to orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      let revenue = 0;
      let pending = 0;
      const recent: any[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Delivered') {
          revenue += (data.totalAmount || 0);
        }
        if (data.status === 'Pending') pending++;
        
        recent.push({
          id: doc.id,
          title: `New Order: ₹${data.totalAmount || 0} (${data.status})`,
          time: new Date(data.createdAt).toLocaleDateString(),
          accent: data.status === 'Delivered' ? 'green' : (data.status === 'Pending' ? 'blue' : 'yellow'),
          createdAt: new Date(data.createdAt).getTime()
        });
      });
      
      recent.sort((a, b) => b.createdAt - a.createdAt);
      setAuditFeed(recent.slice(0, 5));
      
      setStats(prev => {
        const newStats = [...prev];
        newStats[0] = { ...newStats[0], value: `₹${revenue.toLocaleString()}`, detail: "Lifetime" };
        newStats[1] = { ...newStats[1], value: snapshot.docs.length.toString(), detail: "Total placed" };
        return newStats;
      });
      setPulse(p => ({ ...p, pendingOrders: pending.toString() }));
      
      const processedOrders = processFirestoreData(snapshot.docs, 'order', currentYear);
      setAnalyticsData(prev => ({ ...prev, order: processedOrders }));
    });

    // Listen to users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => {
        const newStats = [...prev];
        newStats[2] = { ...newStats[2], value: snapshot.docs.length.toString(), detail: "Registered" };
        return newStats;
      });
      
      const processedUsers = processFirestoreData(snapshot.docs, 'user', currentYear);
      setAnalyticsData(prev => ({ ...prev, user: processedUsers }));
    });

    // Listen to products
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      let active = 0;
      snapshot.forEach(doc => {
        if (doc.data().isActive) active++;
      });
      setStats(prev => {
        const newStats = [...prev];
        newStats[3] = { ...newStats[3], value: active.toString(), detail: "Available" };
        return newStats;
      });
      setPulse(p => ({ ...p, activeProducts: active.toString() }));
      
      const processedProducts = processFirestoreData(snapshot.docs, 'product', currentYear);
      setAnalyticsData(prev => ({ ...prev, product: processedProducts }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeProducts();
    }
  }, []);

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <TopBar
        title="Welcome back, Admin"
        subtitle="Dash Board"
        isSidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" className="icon-button" onClick={() => navigate('/admin/settings')} title="Settings">⚙️</button>
          </div>
        }
      />

      <section className="dashboard-main-grid">
        <div className="overview-cards">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title + index}
              title={stat.title}
              value={stat.value}
              detail={stat.detail}
              badge={stat.badge}
            />
          ))}
        </div>

        <div className="overview-summary fade-up delay-1">
          <div className="summary-header">
            <div>
              <span className="dashboard-subtitle">Realtime monitoring</span>
              <h2>System Pulse</h2>
            </div>
            <button 
              type="button" 
              className="summary-action" 
              onClick={() => navigate('/reports')}
              style={{ cursor: 'pointer' }}
            >
              View report
            </button>
          </div>
          <div className="summary-info">
            <div 
              onClick={() => navigate('/admin/orders')}
              className="pulse-clickable-row"
            >
              <strong>{pulse.pendingOrders}</strong>
              <span>Pending Orders</span>
            </div>
            <div 
              onClick={() => navigate('/admin/products')}
              className="pulse-clickable-row"
            >
              <strong>{pulse.activeProducts}</strong>
              <span>Active Products</span>
            </div>
          </div>
          {/* Progress bars removed as requested */}
        </div>


        <article className="panel panel-chart fade-up delay-2">
          <AnalyticsChart data={analyticsData} />
        </article>

        <aside className="panel panel-feed fade-up delay-3">
          <div className="panel-header">
            <div>
              <h2>Real-time System Audit Feed</h2>
              <p>Latest activity from the platform and approvals.</p>
            </div>
          </div>
          <div className="feed-list">
            {auditFeed.map((item, index) => (
              <div
                key={item.time + item.title}
                className="feed-item fade-up"
                style={{ animationDelay: `${0.4 + index * 0.08}s` }}
              >
                <span className={`feed-dot ${item.accent}`} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

    </>
  )
}
