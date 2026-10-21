export type Dependency = { id: string; name: string; description: string; group: string };

export type ProjectOption = { id: string; name: string };
export type ProjectChoice = { default: string; values: ProjectOption[] };
export type ProjectOptions = {
  type: ProjectChoice;
  language: ProjectChoice;
  bootVersion: ProjectChoice;
  packaging: ProjectChoice;
  configurationFileFormat: ProjectChoice;
  javaVersion: ProjectChoice;
  groupId: { default: string };
  artifactId: { default: string };
  packageName: { default: string };
};

export type ProjectSettingsValues = {
  type: string;
  language: string;
  bootVersion: string;
  groupId: string;
  artifactId: string;
  packaging: string;
  configurationFileFormat: string;
  javaVersion: string;
};
