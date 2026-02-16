import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Clock, DollarSign } from 'lucide-react';

interface BadgeModule {
  id: string;
  title: string;
  location: string;
  description: string;
  status: 'available' | 'coming-soon' | 'completed';
  icon: typeof Home;
  estimatedTime?: string;
  path?: string;
  href?: string;
}

const BADGE_MODULES: BadgeModule[] = [
  {
    id: 'housing-homelessness-bloomington',
    title: 'Housing and Homelessness',
    location: 'Bloomington, Indiana',
    description: 'Learn the facts about housing affordability and homelessness in Bloomington, Indiana.',
    status: 'available',
    icon: Home,
    estimatedTime: '~25 min',
    path: '/housing-homelessness',
  },
  {
    id: 'payment-in-lieu',
    title: 'The $50,000 Question',
    location: 'Bloomington, Indiana',
    description: 'Explore how payment-in-lieu policies work — when developers pay a fee instead of building affordable housing.',
    status: 'available',
    icon: DollarSign,
    estimatedTime: '~15 min',
    href: `${import.meta.env.BASE_URL}payment-in-lieu.html`,
  },
];

export function BadgeHub() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <a
          href="../../"
          className="inline-flex items-center gap-2 text-ev-muted-blue hover:text-ev-coral transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prototypes
        </a>
        <h1 className="text-3xl md:text-4xl font-bold text-ev-black">
          Empowered Badges
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Learning modules that help you focus on facts. Complete a module to earn your badge and become an informed citizen.
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGE_MODULES.map((module) => (
          <BadgeCard key={module.id} module={module} />
        ))}
      </div>

      {/* Empty state for when more modules will be added */}
      {BADGE_MODULES.length <= 2 && (
        <div className="text-center py-8 text-gray-500">
          <p>More learning modules coming soon!</p>
        </div>
      )}
    </div>
  );
}

function BadgeCard({ module }: { module: BadgeModule }) {
  const Icon = module.icon;
  const isAvailable = module.status === 'available';

  const CardContent = (
    <>
      {/* Status Badge */}
      {module.status === 'coming-soon' && (
        <div className="absolute top-3 right-3 bg-gray-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Coming Soon
        </div>
      )}
      {module.status === 'completed' && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Completed
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center
          ${isAvailable ? 'bg-ev-light-blue/20' : 'bg-gray-200'}
        `}>
          <Icon className={`w-7 h-7 ${isAvailable ? 'text-ev-muted-blue' : 'text-gray-400'}`} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={`text-xl font-bold ${isAvailable ? 'text-ev-black' : 'text-gray-500'}`}>
            {module.title}
          </h3>
          <p className={`text-sm font-medium ${isAvailable ? 'text-ev-coral' : 'text-gray-400'}`}>
            {module.location}
          </p>
          <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
            {module.description}
          </p>
        </div>

        {/* Meta & Action */}
        {isAvailable && (
          <div className="pt-2 flex items-center justify-between">
            {module.estimatedTime && (
              <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                {module.estimatedTime}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-ev-muted-blue font-semibold text-sm">
              Start Learning
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (isAvailable && module.href) {
    return (
      <a
        href={module.href}
        className={`
          group relative overflow-hidden rounded-xl border-2 transition-all duration-300
          border-ev-light-blue bg-white hover:border-ev-muted-blue hover:shadow-lg hover:-translate-y-1
        `}
      >
        {CardContent}
      </a>
    );
  }

  if (isAvailable && module.path) {
    return (
      <Link
        to={module.path}
        className={`
          group relative overflow-hidden rounded-xl border-2 transition-all duration-300
          border-ev-light-blue bg-white hover:border-ev-muted-blue hover:shadow-lg hover:-translate-y-1
        `}
      >
        {CardContent}
      </Link>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        border-gray-200 bg-gray-50 cursor-not-allowed opacity-70
      `}
    >
      {CardContent}
    </div>
  );
}
