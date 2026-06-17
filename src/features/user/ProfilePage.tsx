import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const ProfilePage = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Aditya Sharma</h1>
          <p className="text-foreground/60 mb-2">Guwahati, Assam</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Loyalty Member</span>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">Artisan Patron</span>
          </div>
        </div>
        <div className="ml-auto">
          <Button variant="outline" className="glass-panel">Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Tracking</h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View Details &rarr;</Button>
              </div>
              <p className="text-sm text-foreground/60 mb-8">Order #HNE-88291 • Expected Arrival: Oct 24</p>
              
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
                <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary -translate-y-1/2 rounded-full" />
                
                <div className="relative flex justify-between">
                  {['Placed', 'Packed', 'Shipped', 'Delivered'].map((step, i) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 ${i < 3 ? 'bg-primary text-white' : 'bg-black/40 border border-white/20 text-white/50'}`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs ${i < 3 ? 'text-primary' : 'text-foreground/40'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-6">Order History</h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="glass-card border-white/10 p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-16 h-16 rounded-lg bg-black/20 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=200&q=80" alt="Tea" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Vintage Orthodox Black Tea</h4>
                    <p className="text-sm text-foreground/60">Order #HNE-7710{i} • Delivered</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹1,200</div>
                    <div className="text-xs text-foreground/40">May 12, 2024</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="glass-card bg-gradient-to-br from-green-900/40 to-black/40 border-green-500/20">
            <CardContent className="p-6">
              <h3 className="text-xs font-semibold text-green-400 tracking-wider mb-4 uppercase">Sustainability Impact</h3>
              <div className="text-4xl font-light mb-2">12</div>
              <p className="text-sm text-foreground/80 mb-6">Artisans supported this year</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mb-2">
                <div className="bg-green-500 h-1.5 rounded-full w-3/4" />
              </div>
              <p className="text-xs text-right text-green-400/80">Silver Patron Level</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
};
