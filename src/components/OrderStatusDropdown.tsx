
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Package, Truck, X, AlertCircle } from 'lucide-react';

interface OrderStatusDropdownProps {
  currentStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation';
  onStatusChange: (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation') => void;
  disabled?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
  },
  waiting_admin_confirmation: {
    label: 'Waiting Confirmation',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800',
  },
  confirmed: {
    label: 'Confirmed',
    icon: Check,
    color: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Completed',
    icon: Package,
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: X,
    color: 'bg-red-100 text-red-800',
  },
};

export function OrderStatusDropdown({ currentStatus, onStatusChange, disabled }: OrderStatusDropdownProps) {
  const CurrentIcon = statusConfig[currentStatus].icon;

  return (
    <Select
      value={currentStatus}
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            <Badge className={`${statusConfig[currentStatus].color} capitalize px-2 py-1 rounded-full text-xs`}>
              {statusConfig[currentStatus].label}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
