import { Search, CreditCard, Zap, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Browse Products',
      description: 'Explore our wide range of premium subscriptions at unbeatable prices.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Make Payment',
      description: 'Pay securely via UPI, bank transfer, or other payment methods.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Quick Verification',
      description: 'Our team verifies your payment within minutes.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Get Access',
      description: 'Receive your credentials instantly and start enjoying!',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get your premium subscription in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
              )}

              <div className="text-center group">
                {/* Step Number */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400 z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
