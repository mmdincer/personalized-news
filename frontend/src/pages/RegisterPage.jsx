/**
 * Register Page
 * 
 * Public route for user registration
 */

import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;

