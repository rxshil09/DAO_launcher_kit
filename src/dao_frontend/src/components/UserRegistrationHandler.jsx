import { useEffect } from 'react';
import { useActors } from '../context/ActorContext';
import { useAuth } from '../context/AuthContext';

const UserRegistrationHandler = () => {
  const { identity, userSettings } = useAuth();
  const actors = useActors();

  useEffect(() => {
    const registerUser = async () => {
      if (identity && actors) {
        try {
          const result = await actors.daoBackend.registerUser(
            userSettings.displayName,
            ''
          );
          if ('err' in result && result.err !== 'User already registered') {
            console.error('Failed to register user:', result.err);
          }
        } catch (error) {
          console.error('Failed to register user:', error);
        }
      }
    };

    registerUser();
  }, [identity, actors, userSettings.displayName]);

  return null;
};

export default UserRegistrationHandler;
