import { useRouter } from 'expo-router';
import React from 'react';

export default function Send() {
  const router = useRouter();

  // Redirect to first step
  React.useEffect(() => {
    router.replace('/send-contact');
  }, []);

  return null;
}