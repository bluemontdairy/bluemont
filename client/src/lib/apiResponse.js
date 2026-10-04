import { NextResponse } from 'next/server';
import { ValidationError } from './validate';

export const unauthorized = () => NextResponse.json({ message: 'Not authorized' }, { status: 401 });

export const notFound = () => NextResponse.json({ message: 'Not found' }, { status: 404 });

// Validation messages are safe to show; anything else is logged and hidden
// so database or stack details never reach the browser.
export const handleError = (error) => {
  if (error instanceof ValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return NextResponse.json({ message: 'Invalid data.' }, { status: 400 });
  }
  if (error?.code === 11000) {
    return NextResponse.json({ message: 'A record with these details already exists.' }, { status: 409 });
  }
  console.error(error);
  return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
};
