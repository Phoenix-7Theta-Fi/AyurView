import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/chatbot');
  return null; // redirect() is a server-side only function and must be returned or thrown
}
