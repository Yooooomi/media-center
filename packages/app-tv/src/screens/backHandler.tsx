import {useCallback} from 'react';
import {useNavigate} from 'react-router-native';
import {useBack} from '../services/useBack';

export default function BackHandler() {
  const navigate = useNavigate();

  useBack(
    useCallback(() => {
      navigate(-1);
      return true;
    }, [navigate]),
  );

  return null;
}
