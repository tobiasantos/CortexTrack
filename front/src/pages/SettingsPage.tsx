import { useState } from 'react';
import { User, Globe, Palette } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import ClassificationTable from '../components/settings/ClassificationTable';
import PreferencesForm from '../components/settings/PreferencesForm';
import Card from '../components/ui/Card';
import { useSettings } from '../hooks/useSettings';
import { useAuthStore } from '../stores/authStore';

type Tab = 'profile' | 'classifications' | 'preferences';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'classifications', label: 'Site Classifications', icon: Globe },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { classifications, isLoading, error, updateClassification, refetch } = useSettings();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <TopBar title="Settings" />

      <div className="p-4 md:p-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <Card title="Profile">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                  Email
                </label>
                <p className="text-[var(--color-text)]">{user?.email}</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'classifications' && (
          <Card title="Site Classifications">
            {error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <ClassificationTable
                classifications={classifications}
                onUpdate={updateClassification}
              />
            )}
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card title="Preferences">
            <PreferencesForm />
          </Card>
        )}
      </div>
    </div>
  );
}
