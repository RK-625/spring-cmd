"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { getPackageName, initialProjectState, projectReducer, type ProjectState } from "@/lib/project-state";
import type { Dependency, ProjectSettingsValues } from "@/lib/spring";

type SpringProjectContextValue = {
  project: ProjectState["project"] & { packageName: string };
  dependencies: ProjectState["dependencies"] & { available: Dependency[] };
  updateSetting: (key: keyof ProjectSettingsValues, value: string) => void;
  setCustomPackage: (value: string) => void;
  selectDependency: (dependency: Dependency | null) => void;
  setDependencyQuery: (query: string) => void;
  addDependency: () => void;
  removeDependency: (id: string) => void;
  retryProject: () => void;
  retryDependencies: () => void;
};

const SpringProjectContext = createContext<SpringProjectContextValue | null>(null);

export function SpringProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialProjectState);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/project-options", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load project settings");
        const options = await response.json();
        if (!controller.signal.aborted) dispatch({ type: "project/loaded", options });
      } catch {
        if (!controller.signal.aborted) dispatch({ type: "project/failed" });
      }
    }
    void load();
    return () => controller.abort();
  }, [state.project.attempt]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/dependencies", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load dependencies");
        const catalogue = await response.json();
        if (!controller.signal.aborted) dispatch({ type: "dependencies/loaded", catalogue });
      } catch {
        if (!controller.signal.aborted) dispatch({ type: "dependencies/failed" });
      }
    }
    void load();
    return () => controller.abort();
  }, [state.dependencies.attempt]);

  const addedIds = new Set(state.dependencies.added.map(item => item.id));
  const value: SpringProjectContextValue = {
    project: { ...state.project, packageName: getPackageName(state.project) },
    dependencies: {
      ...state.dependencies,
      available: state.dependencies.catalogue.filter(item => !addedIds.has(item.id)),
    },
    updateSetting: (key, value) => dispatch({ type: "project/update", key, value }),
    setCustomPackage: value => dispatch({ type: "project/package", value }),
    selectDependency: dependency => dispatch({ type: "dependencies/select", dependency }),
    setDependencyQuery: query => dispatch({ type: "dependencies/query", query }),
    addDependency: () => dispatch({ type: "dependencies/add" }),
    removeDependency: id => dispatch({ type: "dependencies/remove", id }),
    retryProject: () => dispatch({ type: "project/retry" }),
    retryDependencies: () => dispatch({ type: "dependencies/retry" }),
  };

  return <SpringProjectContext.Provider value={value}>{children}</SpringProjectContext.Provider>;
}

export function useSpringProject() {
  const context = useContext(SpringProjectContext);
  if (!context) throw new Error("useSpringProject must be used within SpringProjectProvider");
  return context;
}
