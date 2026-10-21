import type { Dependency, ProjectOptions, ProjectSettingsValues } from "@/lib/spring";

export type ProjectState = {
  project: {
    options: ProjectOptions | null;
    settings: ProjectSettingsValues | null;
    customPackage: string | null;
    error: string;
    attempt: number;
  };
  dependencies: {
    catalogue: Dependency[];
    selected: Dependency | null;
    added: Dependency[];
    query: string;
    loading: boolean;
    error: string;
    attempt: number;
  };
};

export const initialProjectState: ProjectState = {
  project: { options: null, settings: null, customPackage: null, error: "", attempt: 0 },
  dependencies: { catalogue: [], selected: null, added: [], query: "", loading: true, error: "", attempt: 0 },
};

type Action =
  | { type: "project/loaded"; options: ProjectOptions }
  | { type: "project/failed" }
  | { type: "project/retry" }
  | { type: "project/update"; key: keyof ProjectSettingsValues; value: string }
  | { type: "project/package"; value: string }
  | { type: "dependencies/loaded"; catalogue: Dependency[] }
  | { type: "dependencies/failed" }
  | { type: "dependencies/retry" }
  | { type: "dependencies/select"; dependency: Dependency | null }
  | { type: "dependencies/query"; query: string }
  | { type: "dependencies/add" }
  | { type: "dependencies/remove"; id: string };

export function getPackageName(project: ProjectState["project"]) {
  if (project.customPackage !== null) return project.customPackage;
  if (!project.settings) return "";
  const { groupId, artifactId } = project.settings;
  return `${groupId}.${artifactId.replace(/[^a-zA-Z0-9_]/g, "")}`;
}

export function projectReducer(state: ProjectState, action: Action): ProjectState {
  const { project, dependencies } = state;
  switch (action.type) {
    case "project/loaded": {
      const options = action.options;
      return { ...state, project: { ...project, options, error: "", settings: project.settings ?? {
        type: options.type.default,
        language: options.language.default,
        bootVersion: options.bootVersion.default,
        groupId: options.groupId.default,
        artifactId: options.artifactId.default,
        packaging: options.packaging.default,
        configurationFileFormat: options.configurationFileFormat.default,
        javaVersion: options.javaVersion.default,
      } } };
    }
    case "project/failed":
      return { ...state, project: { ...project, error: "Could not load project settings. Please try again." } };
    case "project/retry":
      return { ...state, project: { ...project, error: "", attempt: project.attempt + 1 } };
    case "project/update":
      return project.settings ? { ...state, project: { ...project, settings: { ...project.settings, [action.key]: action.value } } } : state;
    case "project/package":
      return { ...state, project: { ...project, customPackage: action.value } };
    case "dependencies/loaded":
      return { ...state, dependencies: { ...dependencies, catalogue: action.catalogue, loading: false, error: "" } };
    case "dependencies/failed":
      return { ...state, dependencies: { ...dependencies, loading: false, error: "Could not load Spring dependencies. Please try again." } };
    case "dependencies/retry":
      return { ...state, dependencies: { ...dependencies, loading: true, error: "", attempt: dependencies.attempt + 1 } };
    case "dependencies/select":
      return { ...state, dependencies: { ...dependencies, selected: action.dependency } };
    case "dependencies/query":
      return { ...state, dependencies: { ...dependencies, query: action.query, selected: dependencies.selected?.name === action.query ? dependencies.selected : null } };
    case "dependencies/add": {
      const selected = dependencies.selected;
      if (!selected || dependencies.loading || dependencies.error || dependencies.added.some(item => item.id === selected.id)) return state;
      return { ...state, dependencies: { ...dependencies, added: [...dependencies.added, selected], selected: null, query: "" } };
    }
    case "dependencies/remove":
      return { ...state, dependencies: { ...dependencies, added: dependencies.added.filter(item => item.id !== action.id) } };
  }
}
