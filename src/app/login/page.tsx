'use client';

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
