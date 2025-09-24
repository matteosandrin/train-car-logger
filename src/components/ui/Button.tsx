import React from 'react';

type ButtonVariant = 'pill' | 'primary' | 'secondary' | 'keypad' | 'keypadSecondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
}

const focusRingClasses =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400';

const variantClasses: Record<ButtonVariant, string> = {
  pill: 'rounded-full bg-blue-900/25 px-4 py-2 text-sm font-semibold text-blue-200 transition-transform duration-150 hover:-translate-y-0.5',
  primary:
    'w-full rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 px-6 py-4 text-lg font-semibold text-slate-900 transition-transform duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'rounded-2xl bg-slate-600/40 px-6 py-4 font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600/60',
  keypad:
    'rounded-2xl bg-blue-900/25 py-5 text-2xl font-semibold text-sky-100 transition-colors duration-150 hover:bg-blue-900/40 disabled:cursor-not-allowed disabled:opacity-60',
  keypadSecondary:
    'rounded-2xl bg-slate-600/40 py-5 text-2xl font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600/60',
};

const Button: React.FC<ButtonProps> = ({ variant, className, type = 'button', ...props }) => {
  const composedClassName = [focusRingClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={composedClassName} {...props} />;
};

export default Button;
