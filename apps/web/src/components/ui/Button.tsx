interface ButtonProps {
  children: string | React.ReactNode;
  classes?: string;
  onClick?: () => void;
}

export function Button({ children, classes, onClick }: ButtonProps) {
  const defaultClasses =
    "rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600";

  let finalClasses = defaultClasses;

  if (classes) {
    // Remove conflicting classes from defaults
    const conflictPatterns = [
      /bg-\S+/g,
      /text-\S+/g,
      /hover:\S+/g,
      /px-\S+/g,
      /py-\S+/g,
    ];
    let cleaned = defaultClasses;

    conflictPatterns.forEach((pattern) => {
      if (pattern.test(classes)) {
        cleaned = cleaned.replace(pattern, "");
      }
    });

    finalClasses = `${cleaned} ${classes}`.trim();
  }

  return (
    <button className={finalClasses} onClick={onClick}>
      {children}
    </button>
  );
}
