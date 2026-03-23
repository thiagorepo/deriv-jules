"use client";

import React, { useState } from 'react';
import { useTheme } from '@org/theme';
import { Button, Card } from './ui';

export function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="w-full mb-5">
      <label className="block mb-2 font-bold text-sm text-foreground">
        {label}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full p-3 min-h-[48px] text-base rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        required
      />
    </div>
  );
}

export function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-lg sm:p-8 p-6">
      <h2 className="text-center text-3xl font-extrabold mb-8 text-primary tracking-tight">
        Sign In to {theme.tenantName}
      </h2>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <InputField 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com"
        />
        <InputField 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••"
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-6 text-lg py-3"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <p className="text-center mt-8 text-sm text-muted-foreground">
        Don't have an account? <a href="/register" className="text-primary hover:underline font-semibold">Register here</a>
      </p>
    </Card>
  );
}

export function RegisterForm({ onSubmit, loading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, password });
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-lg sm:p-8 p-6">
      <h2 className="text-center text-3xl font-extrabold mb-8 text-primary tracking-tight">
        Join {theme.tenantName}
      </h2>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <InputField 
          label="Full Name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="John Doe"
        />
        <InputField 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com"
        />
        <InputField 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••"
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-6 text-lg py-3"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      
      <p className="text-center mt-8 text-sm text-muted-foreground">
        Already have an account? <a href="/login" className="text-primary hover:underline font-semibold">Sign in here</a>
      </p>
    </Card>
  );
}
