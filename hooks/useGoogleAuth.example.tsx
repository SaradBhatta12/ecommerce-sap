// Example usage of useGoogleAuth hook in different components/tabs

import { useGoogleAuth } from './useGoogleAuth';

// Example 1: Login Tab Component
export const LoginTab = () => {
  const { handleGoogle, error, isLoading } = useGoogleAuth();

  const handleSignIn = () => {
    // Uses default callback URL: /s/{domain}/dashboard
    handleGoogle();
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleSignIn} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
};

// Example 2: Register Tab Component  
export const RegisterTab = () => {
  const { handleGoogle, error, isLoading } = useGoogleAuth();

  const handleSignUp = () => {
    // Uses custom callback URL for registration flow
    handleGoogle('/s/example-domain/profile/setup');
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleSignUp} disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign up with Google'}
      </button>
    </div>
  );
};

// Example 3: Any component that needs Google OAuth
export const SomeOtherComponent = () => {
  const { handleGoogle, error, isLoading, setError } = useGoogleAuth();

  const handleCustomFlow = () => {
    // Clear any previous errors
    setError(null);
    
    // Use custom callback URL
    handleGoogle('/s/tenant/custom-redirect');
  };

  return (
    <div>
      <button onClick={handleCustomFlow}>Custom Google Auth Flow</button>
    </div>
  );
};
