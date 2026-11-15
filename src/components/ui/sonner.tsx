"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={{
        ["--normal-bg" as string]: "var(--paper)",
        ["--normal-text" as string]: "var(--ink)",
        ["--normal-border" as string]: "var(--line)",
      }}
      {...props}
    />
  );
};
export { Toaster };
