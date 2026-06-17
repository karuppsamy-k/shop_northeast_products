import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { api, type Order } from '@/services/api';
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">Heritage NE</h1>
          <p className="text-xs text-foreground/50">Admin Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
            <TrendingUp className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
            <ShoppingBag className="w-5 h-5" /> Orders
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
            <Package className="w-5 h-5" /> Products
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
            <Users className="w-5 h-5" /> Users
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-sm text-primary tracking-wider uppercase font-semibold mb-1">Administrative Overview</h2>
            <h1 className="text-3xl font-bold">Heritage Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: '₹4,28,500', trend: '+12%' },
            { label: 'Total Orders', value: '1,124', trend: '+8%' },
            { label: 'Active Users', value: '8,902', trend: '-2%' },
            { label: 'New Products', value: '156', trend: '+24%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-foreground/60 mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className={`text-xs mt-2 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-card">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold">Recent Orders</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">₹{order.totalAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
};
