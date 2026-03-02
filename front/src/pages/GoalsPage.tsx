import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import GoalProgress from '../components/goals/GoalProgress';
import GoalForm from '../components/goals/GoalForm';
import { useGoals } from '../hooks/useGoals';
import toast from 'react-hot-toast';
import type { Goal } from '../types';

export default function GoalsPage() {
  const { goals, isLoading, error, saveGoals, deleteGoal, refetch } = useGoals();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (goal: Goal) => {
    try {
      const existing = goals.map((g) => ({ metric: g.metric, target: g.target }));
      const idx = existing.findIndex((g) => g.metric === goal.metric);
      if (idx >= 0) {
        existing[idx] = goal;
      } else {
        existing.push(goal);
      }
      await saveGoals(existing);
      toast.success(editingGoal ? 'Goal updated' : 'Goal created');
      setShowForm(false);
      setEditingGoal(null);
    } catch {
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (metric: string) => {
    try {
      await deleteGoal(metric);
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div>
      <TopBar title="Goals">
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </TopBar>

      <div className="p-4 md:p-8">
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={<Target className="w-12 h-12" />}
            title="No goals set"
            description="Set productivity goals to track your progress daily."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalProgress
                key={goal.metric}
                goal={goal}
                onEdit={() => {
                  setEditingGoal({ metric: goal.metric, target: goal.target });
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(goal.metric)}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GoalForm
          initial={editingGoal}
          existingMetrics={goals.map((g) => g.metric)}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}
