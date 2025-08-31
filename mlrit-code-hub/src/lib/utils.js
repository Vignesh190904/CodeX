// src/lib/utils.ts
import React from 'react';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function renderIcon(Icon, props = {}) {
  if (!Icon) return null;
  try {
    return <Icon {...props} />;
  } catch (error) {
    console.error('Error rendering icon:', error);
    return null;
  }
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
