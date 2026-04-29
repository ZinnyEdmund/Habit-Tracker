import { calculateCurrentStreak } from "@/lib/streaks";
import { getHabitSlug } from "@/lib/slug";
import type { Habit } from "@/types/habit";
import { CSSProperties } from "react";

type HabitCardProps = {
  habit: Habit;
  today: string;
  isConfirmingDelete: boolean;
  onToggleCompletion: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  onDeleteRequest: (habitId: string) => void;
  onDeleteConfirm: (habitId: string) => void;
  onDeleteCancel: () => void;
};

export function HabitCard(props: HabitCardProps) {
  const {
    habit,
    today,
    isConfirmingDelete,
    onToggleCompletion,
    onEdit,
    onDeleteRequest,
    onDeleteConfirm,
    onDeleteCancel,
  } = props;

  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompletedToday = habit.completions.includes(today);

  const styles: Record<string, CSSProperties> = {
    middle: {
      width: "100%",
      margin: "0 auto",
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
      padding: 10,
      background: "rgba(255, 255, 255, 0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 15,
    },
    top: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    streakBox: {
      fontSize: 10,
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: "3px 8px",
      backgroundColor: "color-mix(in srgb, var(--dark-300) 40%, transparent)",
      borderRadius: 7,
    },
    frequencyBox: {
      fontSize: 10,
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: "3px 8px",
      backgroundColor: "color-mix(in srgb, var(--dark-300) 40%, transparent)",
      borderRadius: 7,
    },
    infoBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 4,
    },
    title: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--dark-100)",
      textTransform: "capitalize",
    },
    subtitle: {
      fontSize: 11,
      fontWeight: 450,
      color: "var(--dark-200)",
      textTransform: "lowercase",
    },
    text: {
      fontSize: "11px",
      fontWeight: 450,
      color: "var(--dark-200)",
      textTransform: "lowercase",
    },
    topBox2: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    buttons: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      width: "100%",
    },
    confirmButton: {
      flex: 1,
      fontSize: 10,
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 6,
      backgroundColor: "var(--dark-300)",
      borderRadius: 8,
      width: "100%",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      width: "100%",
    },
    editButton: {
      flex: 0.3,
      fontSize: 10,
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 6,
      backgroundColor: "var(--dark-300)",
      borderRadius: 8,
      width: "100%",
    },
    deleteButton: {
      flex: 0.3,
      fontSize: 10,
      fontWeight: 450,
      color: "var(--light-100)",
      padding: 6,
      backgroundColor: "var(--dark-200)",
      borderRadius: 8,
      width: "100%",
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
  };

  return (
    <>
      <article data-testid={`habit-card-${slug}`} style={styles.middle}>
        <div style={styles.middleMain}>
          <div style={styles.top}>
            <p data-testid={`habit-streak-${slug}`} style={styles.streakBox}>
              Current streak: {streak}
            </p>
            <p style={styles.frequencyBox}>frequency : {habit.frequency}</p>
          </div>

          <div style={styles.infoBox}>
            <h2 style={styles.title}>{habit.name}</h2>
            <p style={styles.subtitle}>
              {habit.description || "No description provided."}
            </p>
          </div>

          <div style={styles.buttons}>
            <button
              data-testid={`habit-complete-${slug}`}
              style={styles.confirmButton}
              type="button"
              onClick={() => onToggleCompletion(habit.id)}
            >
              {isCompletedToday ? "Unmark today" : "Mark complete today"}
            </button>
            <button
              data-testid={`habit-edit-${slug}`}
              style={styles.editButton}
              type="button"
              onClick={() => onEdit(habit.id)}
            >
              Edit
            </button>
            <button
              data-testid={`habit-delete-${slug}`}
              className=""
              style={styles.deleteButton}
              type="button"
              onClick={() => onDeleteRequest(habit.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </article>

      {isConfirmingDelete ? (
        <div style={styles.overlay} onClick={onDeleteCancel}>
          <div style={{ ...styles.middle, maxWidth: 300, padding: 15 }}>
            <p
              style={{
                ...styles.subtitle,
                textTransform: "capitalize",
                textAlign: "center",
                marginBottom: 15,
              }}
            >
              Confirm habit deletion
            </p>
            <div style={styles.buttons}>
              <button
                data-testid="confirm-delete-button"
                style={styles.confirmButton}
                type="button"
                onClick={() => onDeleteConfirm(habit.id)}
              >
                Confirm delete
              </button>
              <button
                style={{ ...styles.deleteButton, flex: 0.5 }}
                onClick={onDeleteCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
