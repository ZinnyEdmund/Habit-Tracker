'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearSession,
  getHabits,
  getValidSession,
  saveHabits,
} from '@/data/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { validateHabitName } from '@/lib/validators';
import type { Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import { getTodayDate } from '@/utils/date';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';

type FormMode = 'create' | 'edit';

type FormState = {
  open: boolean;
  mode: FormMode;
  habitId: string | null;
  name: string;
  description: string;
};

const defaultFormState: FormState = {
  open: false,
  mode: 'create',
  habitId: null,
  name: '',
  description: '',
};

function getUserHabits(userId: string): Habit[] {
  return getHabits().filter((habit) => habit.userId === userId);
}

const styles: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    background:
      "linear-gradient(135deg, var(--light-200) 0%, var(--light-200) 50%, var(--light-200) 100%)",
  },
  noiseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: 0,
    pointerEvents: "none",
    filter: "url(#noiseFilter)",
    opacity: 0.2,
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    padding: 15,
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    zIndex: 1,
  },
  top: {
    width: "100%",
    border: "1px solid var(--light-100)",
    borderRadius: 12,
    padding: 2,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },
  topMain: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    background: "rgba(255, 255, 255, 0.25)",
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
  },
  topBox1: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  subtitle: { 
    fontSize: "11px", 
    fontWeight: 450, 
    color: "var(--dark-200)", 
    textAlign: "center",
  },
  title: { 
    fontSize: "14px", 
    fontWeight: 500, 
    color: "var(--dark-100)", 
    textAlign: "center",
  },
  topBox2: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: { 
    fontSize: "11px", 
    fontWeight: 450, 
    color: "var(--dark-200)",
    padding: "3px 8px",
    backgroundColor: "var(--dark-300)", 
    border: "1px solid var(--light-100)",
    borderRadius: 7
  },
  createButton: { 
    fontSize: "11px", 
    fontWeight: 400, 
    color: "var(--light-100)",
    padding: "3px 8px",
    backgroundColor: "var(--dark-200)", 
    border: "1px solid var(--light-100)",
    borderRadius: 7
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },
  middle: {
    width: "100%",
    border: "1px solid var(--light-100)",
    borderRadius: 12,
    padding: 2,
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },
  middleMain: {
    width: "100%",
    borderRadius: 10,
    padding: 20,
    background: "rgba(255, 255, 255, 0.85)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: "400px",
    padding: 15
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--light-100)",
    borderTop: "3px solid var(--dark-200)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingHabitId, setConfirmingHabitId] = useState<string | null>(null);
  const today = getTodayDate();

  useEffect(() => {
    const activeSession = getValidSession();

    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
    setHabits(getUserHabits(activeSession.userId));
    setIsReady(true);
  }, []);

  const syncHabits = (updatedHabits: Habit[]) => {
    if (!session) {
      return;
    }

    const allHabits = getHabits();
    const otherUsersHabits = allHabits.filter((habit) => habit.userId !== session.userId);
    const nextHabits = [...otherUsersHabits, ...updatedHabits];

    saveHabits(nextHabits);
    setHabits(updatedHabits);
  };

  const openCreateForm = () => {
    setFormError(null);
    setConfirmingHabitId(null);
    setFormState({
      open: true,
      mode: 'create',
      habitId: null,
      name: '',
      description: '',
    });
  };

  const closeForm = () => {
    setFormError(null);
    setFormState(defaultFormState);
  };

  const handleSaveHabit = (values: {
    name: string;
    description: string;
    frequency: 'daily';
  }) => {
    if (!session) {
      return;
    }

    const validation = validateHabitName(values.name);

    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    setFormError(null);

    if (formState.mode === 'edit' && formState.habitId) {
      const nextHabits = habits.map((habit) =>
        habit.id === formState.habitId
          ? {
              ...habit,
              name: validation.value,
              description: values.description,
              frequency: 'daily' as const,
            }
          : habit,
      );

      syncHabits(nextHabits);
      closeForm();
      return;
    }

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: validation.value,
      description: values.description,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      completions: [],
    };

    syncHabits([...habits, newHabit]);
    closeForm();
  };

  const handleEditHabit = (habitId: string) => {
    const habit = habits.find((entry) => entry.id === habitId);

    if (!habit) {
      return;
    }

    setFormError(null);
    setConfirmingHabitId(null);
    setFormState({
      open: true,
      mode: 'edit',
      habitId: habit.id,
      name: habit.name,
      description: habit.description,
    });
  };

  const handleDeleteRequest = (habitId: string) => {
    setConfirmingHabitId(habitId);
  };

  const handleDeleteConfirm = (habitId: string) => {
    const nextHabits = habits.filter((habit) => habit.id !== habitId);
    syncHabits(nextHabits);
    setConfirmingHabitId(null);

    if (formState.habitId === habitId) {
      closeForm();
    }
  };

  const handleToggleCompletion = (habitId: string) => {
    const nextHabits = habits.map((habit) =>
      habit.id === habitId ? toggleHabitCompletion(habit, today) : habit,
    );

    syncHabits(nextHabits);
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); 
    const diff = today.getDate() - day;
    const start = new Date(today.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const completedThisWeek = habits.filter((habit) => {
    return habit.completions.some((date) => {
      const d = new Date(date);
      return d >= getStartOfWeek();
    });
  }).length;

  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        setScreen("mobile");
      } else if (width <= 1024) {
        setScreen("tablet");
      } else {
        setScreen("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isReady || !session) {
    return (
      <main
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--light-200)",
        }}
      >
        <div style={styles.spinner} />
      </main>
    );
  }

  const isMobile = screen === "mobile";

  return (
    <main style={styles.container}>
      <svg style={{ display: "none" }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
        </filter>
      </svg>
      
      <div style={styles.noiseOverlay} />

      <div style={styles.main}>
        <header style={styles.top}>
          <div
            style={{
              ...styles.topMain,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 10 : 15,
            }}
          >
            <div style={styles.topBox1}>
              <p style={styles.subtitle}>Hi, {session.email}!</p>
              <h1 style={styles.title}>You have completed {completedThisWeek} tasks today!</h1>
            </div>
            <div style={styles.topBox2}>
              <button
                data-testid="auth-logout-button"
                style={styles.logoutButton}
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
              <button
                data-testid="create-habit-button"
                style={styles.createButton}
                type="button"
                onClick={openCreateForm}
              >
                Create habit
              </button>
            </div>
          </div>
        </header>

        <section data-testid="dashboard-page" className="space-y-6">
          {formState.open && (
            <div style={styles.overlay}>
              <div style={styles.modal}>
                <HabitForm
                  initialValues={{
                  name: formState.name,
                  description: formState.description,
                  frequency: 'daily',
                }}
                  error={formError}
                  submitLabel={formState.mode === 'edit' ? 'Update habit' : 'Save habit'}
                  onSubmit={handleSaveHabit}
                  onCancel={closeForm}
                />
              </div>
            </div>
          )}

          {habits.length === 0 ? (
            <section
              data-testid="empty-state"
              style={styles.middle}
            >
              <div style={styles.middleMain}>
                <h3 style={styles.title}>No habits yet</h3>
                <p style={styles.subtitle}>
                  Create your first daily habit to start building a streak.
                </p>
              </div>
            </section>
          ) : (
            <section
              style={{
                ...styles.grid,
                gridTemplateColumns:
                  screen === "mobile"
                    ? "repeat(1, 1fr)"
                    : screen === "tablet"
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
              }}
            >
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  today={today}
                  isConfirmingDelete={confirmingHabitId === habit.id}
                  onToggleCompletion={handleToggleCompletion}
                  onEdit={handleEditHabit}
                  onDeleteRequest={handleDeleteRequest}
                  onDeleteConfirm={handleDeleteConfirm}
                  onDeleteCancel={() => setConfirmingHabitId(null)}
                />
              ))}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
