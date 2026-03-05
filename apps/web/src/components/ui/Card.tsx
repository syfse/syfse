import React from "react";
import { Button } from "./Button";

interface CardProps {
    children: React.ReactNode;
    classes?: string;
    buttonConfig?: {
        useDefault?: boolean; // Use Default buttons (exit, submit)
        alignment?: "left" | "center" | "right";
        customButtons?: React.ReactNode[]; // Custom buttons if useDefault is false
        customClasses?: string; // Custom classes for button container
    },
    footer?: React.ReactNode;
}

export function Card({ children, classes, buttonConfig = { useDefault: true, alignment: "right" }, footer }: CardProps) {
  return (
    <div className="flex items-center">
      <div className={`rounded-lg bg-gray-50 px-16 py-14 ${classes || ""}`}>
        {/* Content Section */}
        <div>{children}</div>

        {/* Button Section */}

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
                <Button classes="mr-4 bg-gray-300 text-gray-700 hover:bg-gray-400">Exit</Button>
                <Button>Submit</Button>
              </>
            ) : (
              buttonConfig.customButtons && buttonConfig.customButtons.map((button, index) => (
                <React.Fragment key={index}>{button}</React.Fragment>
              ))
            )}
          </div>
        )}

        {/* Footer Section */}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}