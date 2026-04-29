"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";

type HabitFormValues = {
  name: string;
  description: string;
  frequency: "daily";
};

type HabitFormProps = {
  initialValues: HabitFormValues;
  error: string | null;
  submitLabel: string;
  onSubmit: (values: HabitFormValues) => void;
  onCancel: () => void;
};

export function HabitForm(props: HabitFormProps) {
  const { initialValues, error, submitLabel, onSubmit, onCancel } = props;
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);

  useEffect(() => {
    setName(initialValues.name);
    setDescription(initialValues.description);
  }, [initialValues.description, initialValues.name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      name,
      description,
      frequency: "daily",
    });
  };

  const styles: Record<string, CSSProperties> = {
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
      padding: 10,
      background: "rgba(255, 255, 255, 0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 15,
    },
    inputWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },
    label: {
      fontSize: 11,
      fontWeight: 450,
      marginBottom: 8,
      color: "var(--dark-200)",
    },
    input: {
      width: "100%",
      padding: "9px 14px",
      fontSize: 10,
      fontWeight: 450,
      borderRadius: 8,
      border: "1px solid var(--dark-300)",
      outline: "none",
      boxSizing: "border-box",
      backgroundColor: "var(--light-200)",
      color: "var(--dark-100)",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      width: "100%",
    },
    updateButton: {
      fontSize: 10,
      fontWeight: 450,
      color: "var(--dark-200)",
      height: 32,
      backgroundColor: "var(--dark-300)",
      borderRadius: 8,
      width: "100%",
    },
    cancelButton: {
      fontSize: 10,
      fontWeight: 450,
      color: "var(--light-100)",
      height: 32,
      backgroundColor: "var(--dark-200)",
      borderRadius: 8,
      width: "100%",
    },
    errorText: {
      fontSize: 11,
      fontWeight: 450,
      color: "#b42318",
    },
  };

  return (
    <form
      data-testid="habit-form"
      style={styles.middle}
      onSubmit={handleSubmit}
    >
      <div style={styles.middleMain}>
        <div style={styles.inputWrapper}>
          <label style={styles.label} htmlFor="habit-name">
            Habit name
          </label>
          <input
            id="habit-name"
            data-testid="habit-name-input"
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <label style={styles.label} htmlFor="habit-description">
            Description
          </label>
          <textarea
            id="habit-description"
            data-testid="habit-description-input"
            style={styles.input}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <label style={styles.label} htmlFor="habit-frequency">
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            style={styles.input}
            value="daily"
            onChange={() => undefined}
            disabled
          >
            <option value="daily">daily</option>
          </select>
        </div>

        {error ? <p style={styles.errorText}>{error}</p> : null}

        <div style={styles.button}>
          <button
            style={styles.updateButton}
            type="submit"
            data-testid="habit-save-button"
          >
            {submitLabel}
          </button>
          <button style={styles.cancelButton} type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
