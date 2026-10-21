import type { Dependency, ProjectSettingsValues } from "@/lib/spring";

type CommandResult = { command: string; error: string | null };

// Quote one argument for Bash/zsh; never interpolate a value as shell code.
function quoteArgument(value: string) {
  return /^[a-zA-Z0-9_./,:=-]+$/.test(value)
    ? value
    : `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function buildSpringCommand(
  settings: ProjectSettingsValues,
  packageName: string,
  dependencies: Dependency[],
): CommandResult {
  if (!settings.groupId.trim() || !settings.artifactId.trim() || !packageName.trim()) {
    return { command: "", error: "Enter a group, artifact, and package name to copy the command." };
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(settings.artifactId)) {
    return { command: "", error: "Use letters, numbers, dots, hyphens, or underscores for the artifact, starting with a letter or number." };
  }
  if (settings.configurationFileFormat !== "properties") {
    return { command: "", error: "Spring CLI supports Properties configuration." };
  }

  const args = [
    `--type=${settings.type}`,
    `--language=${settings.language}`,
    `--boot-version=${settings.bootVersion}`,
    `--group-id=${settings.groupId}`,
    `--artifact-id=${settings.artifactId}`,
    `--package-name=${packageName}`,
    `--packaging=${settings.packaging}`,
    `--java-version=${settings.javaVersion}`,
  ];
  if (dependencies.length) {
    args.push(`--dependencies=${dependencies.map(item => item.id).join(",")}`);
  }
  // Explicit extraction avoids treating dotted artifact names as archive files.
  args.push("--extract", `./${settings.artifactId}`);
  return { command: `spring init ${args.map(quoteArgument).join(" ")}`, error: null };
}
