import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordFormValues {
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  
  // Get email from URL params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const password = watch('password');
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      await resetPassword(email, data.otp, data.password);
      setSuccessful(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        {!successful && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter the verification code sent to your email and create a new password
          </p>
        )}
      </div>
      
      {!successful ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {email && (
            <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-4 mb-4">
              <p className="text-info-800 dark:text-info-300 text-sm">
                Resetting password for: <span className="font-medium">{email}</span>
              </p>
            </div>
          )}
          
          <Input
            label="Verification Code"
            type="text"
            id="otp"
            placeholder="Enter the 6-digit code"
            error={errors.otp?.message}
            {...register('otp', {
              required: 'Verification code is required',
              minLength: {
                value: 6,
                message: 'Verification code must be 6 digits',
              },
              maxLength: {
                value: 6,
                message: 'Verification code must be 6 digits',
              },
            })}
          />
          
          <Input
            label="New Password"
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
            label="Confirm New Password"
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
          >
            Reset Password
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Password Reset Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          
          <Link
            to="/login"
            className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go to Login
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default ResetPassword;