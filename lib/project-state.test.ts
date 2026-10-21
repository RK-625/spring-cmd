import { test } from "node:test";
import assert from "node:assert/strict";
import { getPackageName, initialProjectState, projectReducer } from "./project-state";
import type { Dependency, ProjectOptions } from "./spring";

const choice = (value: string) => ({ default: value, values: [{ id: value, name: value }] });
const options: ProjectOptions = {
  type: choice("gradle-project"), language: choice("java"), bootVersion: choice("4.1.1"),
  packaging: choice("jar"), configurationFileFormat: choice("properties"), javaVersion: choice("17"),
  groupId: { default: "com.example" }, artifactId: { default: "demo" }, packageName: { default: "com.example.demo" },
};
const web: Dependency = { id: "web", name: "Spring Web", description: "Web applications", group: "Web" };

function loadedState() {
  const state = projectReducer(initialProjectState, { type: "project/loaded", options });
  return projectReducer(state, { type: "dependencies/loaded", catalogue: [web] });
}

test("project edits and dependency changes preserve each other's state", () => {
  let state = loadedState();
  state = projectReducer(state, { type: "project/update", key: "groupId", value: "org.acme" });
  state = projectReducer(state, { type: "dependencies/select", dependency: web });
  state = projectReducer(state, { type: "dependencies/add" });
  assert.equal(state.project.settings?.groupId, "org.acme");
  assert.equal(getPackageName(state.project), "org.acme.demo");
  state = projectReducer(state, { type: "project/update", key: "language", value: "kotlin" });
  assert.deepEqual(state.dependencies.added, [web]);
  state = projectReducer(state, { type: "dependencies/select", dependency: web });
  state = projectReducer(state, { type: "dependencies/add" });
  assert.equal(state.dependencies.added.length, 1);
  state = projectReducer(state, { type: "dependencies/remove", id: "web" });
  assert.deepEqual(state.dependencies.added, []);
  assert.equal(state.project.settings?.language, "kotlin");
});

test("package follows metadata until manually edited; query edits clear stale selections", () => {
  let state = loadedState();
  state = projectReducer(state, { type: "project/update", key: "artifactId", value: "sample-app" });
  assert.equal(getPackageName(state.project), "com.example.sampleapp");
  state = projectReducer(state, { type: "project/package", value: "org.custom.app" });
  state = projectReducer(state, { type: "project/update", key: "groupId", value: "org.other" });
  assert.equal(getPackageName(state.project), "org.custom.app");
  state = projectReducer(state, { type: "dependencies/select", dependency: web });
  state = projectReducer(state, { type: "dependencies/query", query: "Spring Web" });
  assert.equal(state.dependencies.selected, web);
  state = projectReducer(state, { type: "dependencies/query", query: "lombok" });
  assert.equal(state.dependencies.selected, null);
  state = projectReducer(state, { type: "dependencies/add" });
  assert.deepEqual(state.dependencies.added, []);
});

test("each retry clears its own error and preserves the other panel and form edits", () => {
  let state = loadedState();
  state = projectReducer(state, { type: "project/update", key: "artifactId", value: "edited" });
  state = projectReducer(state, { type: "project/failed" });
  state = projectReducer(state, { type: "dependencies/failed" });
  state = projectReducer(state, { type: "dependencies/retry" });
  assert.equal(state.dependencies.loading, true);
  assert.equal(state.dependencies.error, "");
  assert.notEqual(state.project.error, "");
  state = projectReducer(state, { type: "project/retry" });
  state = projectReducer(state, { type: "project/loaded", options });
  assert.equal(state.project.settings?.artifactId, "edited");
  assert.equal(state.project.error, "");
  assert.equal(state.dependencies.attempt, 1);
  assert.equal(state.project.attempt, 1);
});
