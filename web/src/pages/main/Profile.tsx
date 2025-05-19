import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Camera, Save, Mail, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../lib/api';

interface ProfileFormValues {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const { data } = await userApi.updateProfilePicture(file);
      
      if (data.user) {
        updateUser({ avatar: data.user.avatar });
        toast.success('Profile picture updated');
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      const response = await userApi.updateProfile(data);
      
      if (response.data.user) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-dark-900 rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-40 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name || ''} 
                  size="xl"
                  className="border-4 border-white dark:border-dark-900"
                />
              </motion.div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 shadow-md hover:bg-primary-600 transition-colors duration-200"
                title="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                id="name"
                placeholder="John Doe"
                leftIcon={<User className="h-5 w-5" />}
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              
              <Input
                label="Email Address"
                id="email"
                placeholder="john@example.com"
                leftIcon={<Mail className="h-5 w-5" />}
                disabled
                {...register('email')}
              />
              
              <Input
                label="Phone Number"
                id="phone"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-5 w-5" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
              
              <Input
                label="Location"
                id="location"
                placeholder="New York, USA"
                leftIcon={<MapPin className="h-5 w-5" />}
                error={errors.location?.message}
                {...register('location')}
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Write a short bio about yourself..."
                className="input-base"
                {...register('bio')}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!isDirty}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
          <ul className="space-y-4">
            <li>
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
            </li>
            <li>
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
            </li>
            <li>
              <Button variant="outline" className="w-full justify-start">
                Notification Preferences
              </Button>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-dark-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            These actions are permanent and cannot be undone.
          </p>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Download My Data
            </Button>
            <Button variant="danger" className="w-full justify-start">
              Deactivate Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;