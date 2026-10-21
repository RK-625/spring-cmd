"use client";

import { useSpringProject } from "@/components/spring-project-provider";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CmdBuilder() {
  const { command, commandError, copyStatus, copyCommand } = useSpringProject();

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button variant="outline" disabled={!command} onClick={copyCommand} title={command || "Configure your project to copy its Spring command"}>
        {copyStatus === "copied" ? <IconCheck data-icon="inline-start" /> : <IconCopy data-icon="inline-start" />}
        {copyStatus === "copied" ? "Copied" : "Copy command"}
      </Button>
      <div aria-live="polite">
        {(commandError || copyStatus === "error") && (
          <FieldError>{commandError || "Could not copy the command. Allow clipboard access and try again."}</FieldError>
        )}
        {copyStatus === "copied" && <span className="sr-only">Spring init command copied to clipboard.</span>}
      </div>
    </div>
  );
}
