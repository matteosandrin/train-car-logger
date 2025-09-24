import React from 'react';

type ButtonVariant = 'pill' | 'primary' | 'secondary' | 'keypad' | 'keypadSecondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
}

const focusRingClasses =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

const variantClasses: Record<ButtonVariant, string> = {
  pill: 'rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition-all duration-150 md:hover:-translate-y-0.5 md:hover:bg-sky-200',
  primary:
    'w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition-colors duration-150 md:hover:bg-blue-700 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'rounded-2xl bg-white px-6 py-4 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors duration-150 md:hover:bg-slate-50 active:bg-slate-100',
  keypad:
    'rounded-2xl bg-sky-100 py-3 md:py-5 text-2xl font-semibold text-sky-700 transition-colors duration-150 md:hover:bg-sky-200 active:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60',
  keypadSecondary:
    'rounded-2xl bg-white py-3 md:py-5 text-2xl font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors duration-150 md:hover:bg-slate-50 active:bg-slate-100',
};

const Button: React.FC<ButtonProps> = ({ variant, className, type = 'button', ...props }) => {
  const composedClassName = [focusRingClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={composedClassName} {...props} />;
};

export default Button;
