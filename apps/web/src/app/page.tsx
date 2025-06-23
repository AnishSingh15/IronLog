import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'IronLog - Professional Fitness Tracking',
  description:
    'Track your workouts, monitor progress, and achieve your fitness goals with IronLog.',
};

const features = [
  {
    title: 'Smart Workout Tracking',
    description: 'Pre-defined workout splits with automatic progression tracking',
  },
  {
    title: 'Built-in Rest Timer',
    description: 'Never miss a beat with our intelligent rest timer and notifications',
  },
  {
    title: 'Progress Analytics',
    description: 'Visual progress tracking with calendar heatmaps and detailed statistics',
  },
  {
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security and encryption',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            IronLog
          </h1>
          <h2 className="text-xl md:text-2xl text-slate-300 mb-6 font-light">
            Professional Fitness Tracking for Serious Athletes
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals with our
            comprehensive fitness tracking platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              data-testid="register-link"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              data-testid="login-link"
              className="px-8 py-3 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white font-medium rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Transform Your Fitness Journey?
          </h3>
          <p className="text-slate-300 mb-6 text-lg">
            Join thousands of athletes who trust IronLog to track their progress.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
          >
            Start Tracking Today
          </Link>
        </div>
      </div>
    </div>
  );
}
