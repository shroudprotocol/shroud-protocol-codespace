import React from 'react';

// Use React.forwardRef to allow parent components to pass a ref to the input element
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const baseStyles = 'w-full bg-background border border-secondary/50 rounded-lg px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50';
  
  return (
    <input
      ref={ref}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input'; // Set a display name for better debugging

export default Input;