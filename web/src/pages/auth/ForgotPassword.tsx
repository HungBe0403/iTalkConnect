import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const { forgotPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await forgotPassword(data.email);
      setEmail(data.email);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to send reset instructions:', error);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {!submitted 
            ? "Enter your email and we'll send you instructions to reset your password"
            : `We've sent reset instructions to ${email}`
          }
        </p>
      </div>
      
      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Send Reset Instructions
          </Button>
        </form>
      ) : (
        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4 mb-6">
          <p className="text-success-800 dark:text-success-200 text-sm">
            Check your email for the reset link. Follow the instructions to reset your password.
          </p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;