// frontend/nextjs-dashboard/app/dashboard/report-administrator/calculator/scripts/InputField.tsx
import * as React from 'react';
import clsx from 'clsx';

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export function NumberInput({ label, className, ...rest }: NumberInputProps) {
  return (
    <>
      {label && <label>{label}</label>}
      <input
        {...rest}
        className={clsx('text-right w-full border-none focus:ring-transparent focus:outline-none', className)}
      />
    </>
  );
}
