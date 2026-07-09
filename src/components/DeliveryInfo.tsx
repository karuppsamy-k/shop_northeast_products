import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, Truck, Clock, ShoppingBag, CreditCard, Calendar, MapPin, Store, Package, XCircle, FileWarning, AlertCircle, QrCode, Info } from 'lucide-react';

interface AccordionProps {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion = ({ title, icon: Icon, color, bgColor, isOpen, onToggle, children }: AccordionProps) => {
  return (
    <div className="rounded-2xl border mb-4 overflow-hidden" style={{ background: 'var(--glass-card-bg)', borderColor: 'var(--glass-border)' }}>
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-white font-bold transition-colors"
        style={{ background: bgColor }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="tracking-wide uppercase">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ icon: Icon, text }: { icon: React.ElementType, text: React.ReactNode }) => (
  <div className="flex gap-4 items-start">
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-muted-fg)' }}>
      <Icon className="w-4 h-4" />
    </div>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg)' }}>{text}</p>
  </div>
);

export const DeliveryInfo = () => {
  const [openSection, setOpenSection] = useState<'bangalore' | 'outside' | null>(null);

  return (
    <div className="mb-8">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1a4731,#2d6a4f)' }}>
          <Info className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold" style={{ color: 'var(--color-fg)' }}>Delivery Details</h3>
      </div>
      <Accordion
        title="Within Bangalore"
        icon={Bike}
        color="#166534"
        bgColor="#2e6f40"
        isOpen={openSection === 'bangalore'}
        onToggle={() => setOpenSection(openSection === 'bangalore' ? null : 'bangalore')}
      >
        <InfoItem icon={Clock} text="Delivery time: 30 mins to 2 hours" />
        <InfoItem icon={ShoppingBag} text="No minimum order" />
        <InfoItem icon={Bike} text="Delivery charge based on Porter / Rapido actual fare" />
        <InfoItem icon={CreditCard} text="Payment: Prepaid only (COD not available)" />
        <InfoItem icon={Calendar} text="Pre-order items must be ordered 1 day in advance" />
        <InfoItem icon={MapPin} text="Store pickup is also available" />
        <InfoItem icon={Store} text="Store timing: 11 AM to 11 PM" />
      </Accordion>

      <Accordion
        title="Outside Bangalore"
        icon={Truck}
        color="#9a3412"
        bgColor="#a04d16"
        isOpen={openSection === 'outside'}
        onToggle={() => setOpenSection(openSection === 'outside' ? null : 'outside')}
      >
        <InfoItem icon={ShoppingBag} text="Minimum order: ₹500" />
        <InfoItem icon={AlertCircle} text="COD not available" />
        <InfoItem icon={Clock} text="Delivery time: 3 to 6 working days" />
        <InfoItem icon={MapPin} text="Courier charges depend on location & parcel weight" />
        <InfoItem icon={Truck} text="Fresh items shipped only at customer's own risk" />
        <InfoItem icon={XCircle} text="No cancellation or return after dispatch" />
        <InfoItem icon={Package} text="Tracking details will be shared after shipment" />
        <InfoItem icon={FileWarning} text="Failed delivery may attract RTO charges" />
      </Accordion>

      <div className="rounded-2xl p-4 mt-6 flex items-start gap-3 border" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg)' }}>
          Please ignore any <strong>"Free Delivery"</strong> shown on the website. Actual charges confirmed based on <strong style={{ color: '#ef4444' }}>your location.</strong>
        </p>
      </div>

      <div className="rounded-2xl p-4 mt-4 flex items-start gap-3 border" style={{ background: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
        <QrCode className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#a855f7' }} />
        <div>
          <h4 className="text-sm font-bold mb-1" style={{ color: '#a855f7' }}>IMPORTANT</h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg)' }}>
            Payment only on <strong>QR code</strong> provided in your{' '}
            <strong style={{ color: '#a855f7' }}>WhatsApp.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
