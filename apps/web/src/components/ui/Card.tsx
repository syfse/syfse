import type React from "react";

interface CardProps {
    children: React.ReactNode;
    classes?: string;
    buttonConfig?: {
        useDefault?: boolean; // Use Default buttons (exit, submit)
        alignment?: "left" | "center" | "right";
        customClasses?: string;
    }
}

export function Card({ children, classes, buttonConfig }: CardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className={`rounded-lg bg-gray-50 px-16 py-14 ${classes || ""}`}>
        <div>{children}</div>
        {buttonConfig && (
          <div
            className={`mt-6 flex ${
              buttonConfig.alignment === "left"
                ? "justify-start"
                : buttonConfig.alignment === "center"
                  ? "justify-center"
                  : "justify-end"
            } ${buttonConfig.customClasses || ""}`}
          >
            {buttonConfig.useDefault ? (
              <>
                <button className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                  Exit
                </button>
                <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Submit
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}