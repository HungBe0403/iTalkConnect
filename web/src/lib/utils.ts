import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format: 'relative' | 'time' | 'date' | 'datetime' = 'relative'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // For invalid dates
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (format === 'date') {
    return d.toLocaleDateString();
  }
  
  if (format === 'datetime') {
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Relative time formatting
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  }
  
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  
  if (diffDay === 1) {
    return 'Yesterday';
  }
  
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }
  
  return d.toLocaleDateString();
}

export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getOtherParticipant(participants: any[], currentUserId: string) {
  return participants.find(p => p.id !== currentUserId);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}