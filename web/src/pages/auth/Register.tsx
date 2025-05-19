import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { register: registerUser, verifyOTP } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const emailResult = await registerUser(data.name, data.email, data.password);
      setEmail(emailResult);
      setShowOtp(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      await verifyOTP(email, otp);
      navigate('/chats');
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign up to get started with Chatterbox</p>
      </div>
      
      {!showOtp ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
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
            type="email"
            id="email"
            placeholder="your@email.com"
            leftIcon={<Mail className="h-5 w-5" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
          />
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
            rightIcon={<UserPlus className="h-4 w-4" />}
          >
            Sign Up
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a verification code to <span className="font-medium">{email}</span>
            </p>
          </div>
          
          <Input
            label="Verification Code"
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          
          <Button
            onClick={handleVerifyOTP}
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Verify Email
          </Button>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;