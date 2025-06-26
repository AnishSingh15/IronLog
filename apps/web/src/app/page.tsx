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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent">
            IronLog
          </h1>
          <h2 className="text-xl md:text-2xl text-amber-900 mb-6 font-light">
            Professional Fitness Tracking for Serious Athletes
          </h2>
          <p className="text-lg text-amber-700 mb-8 max-w-2xl mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals with our
            comprehensive fitness tracking platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              data-testid="register-link"
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              data-testid="login-link"
              className="px-8 py-3 border-2 border-amber-600 text-amber-800 hover:bg-amber-600 hover:text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
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
              className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-6 hover:bg-white/90 hover:border-amber-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-amber-900 mb-3">{feature.title}</h3>
              <p className="text-amber-700 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-semibold text-amber-900 mb-4">
            Ready to Transform Your Fitness Journey?
          </h3>
          <p className="text-amber-800 mb-6 text-lg">
            Join thousands of athletes who trust IronLog to track their progress.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 text-lg shadow-lg hover:shadow-xl"
          >
            Start Tracking Today
          </Link>
        </div>
      </div>
    </div>
  );
}
