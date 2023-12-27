import {useCallback} from 'react';
import {useBack} from '../services/useBack';
import {useNavigate} from './params';

export default function BackHandler() {
  const {goBack} = useNavigate();

  useBack(
    useCallback(() => {
      goBack();
      return true;
    }, [goBack]),
  );

  return null;
}
