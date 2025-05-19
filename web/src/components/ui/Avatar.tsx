import { memo } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | null;
  className?: string;
}

const Avatar = ({ src, alt, size = 'md', status, className = '' }: AvatarProps) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const statusSizeMap = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColorMap = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  };

  return (
    <div className={`relative rounded-full flex items-center justify-center overflow-hidden ${sizeMap[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Replace with fallback on error
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + (alt?.[0] || '?');
          }}
        />
      ) : (
        <div className={`${sizeMap[size]} bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-gray-400 flex items-center justify-center`}>
          <User className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} />
        </div>
      )}
      
      {status && (
        <div className={`absolute bottom-0 right-0 ${statusSizeMap[size]} ${statusColorMap[status]} border-2 border-white dark:border-dark-800 rounded-full`} />
      )}
    </div>
  );
};

export default memo(Avatar);