import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { buildSpringCommand } from "./spring-command";
import type { Dependency, ProjectSettingsValues } from "./spring";

const settings: ProjectSettingsValues = {
  type: "gradle-project", language: "java", bootVersion: "4.1.1", groupId: "com.example",
  artifactId: "demo", packaging: "jar", configurationFileFormat: "properties", javaVersion: "17",
};
const dependencies: Dependency[] = [
  { id: "web", name: "Spring Web", description: "Web", group: "Web" },
  { id: "data-jpa", name: "Spring Data JPA", description: "JPA", group: "SQL" },
];

test("includes exact project settings and dependency IDs in spring init syntax", () => {
  const result = buildSpringCommand(settings, "com.example.demo", dependencies);
  assert.equal(result.error, null);
  assert.equal(result.command, "spring init --type=gradle-project --language=java --boot-version=4.1.1 --group-id=com.example --artifact-id=demo --package-name=com.example.demo --packaging=jar --java-version=17 --dependencies=web,data-jpa --extract ./demo");
});

test("preserves Gradle Kotlin DSL and Maven types and omits empty dependencies", () => {
  for (const type of ["gradle-project-kotlin", "maven-project"]) {
    const result = buildSpringCommand({ ...settings, type, language: "kotlin", packaging: "war", javaVersion: "21" }, "org.example.app", []);
    assert.ok(result.command.includes(`--type=${type}`));
    assert.ok(result.command.includes("--language=kotlin"));
    assert.ok(result.command.includes("--packaging=war"));
    assert.ok(result.command.includes("--java-version=21"));
    assert.ok(!result.command.includes("--dependencies"));
    assert.ok(!result.command.includes("--force"));
  }
});

test("extracts dotted artifact names into a directory", () => {
  const result = buildSpringCommand({ ...settings, artifactId: "demo.app" }, "com.example.demo", []);
  assert.ok(result.command.endsWith("--extract ./demo.app"));
});

test("blocks missing fields, invalid output paths, and unsupported configuration", () => {
  for (const artifactId of ["", "../outside", "/tmp/app", "--force", "my app"]) {
    assert.equal(buildSpringCommand({ ...settings, artifactId }, "com.example.demo", []).command, "");
  }
  assert.ok(buildSpringCommand({ ...settings, groupId: " " }, "com.example.demo", []).error);
  assert.ok(buildSpringCommand(settings, "", []).error);
  assert.ok(buildSpringCommand({ ...settings, configurationFileFormat: "yaml" }, "com.example.demo", []).error);
});

test("shell quoting keeps special characters literal without executing substitutions", () => {
  const groupId = "org.$(printf SHOULD_NOT_RUN); 'quoted'";
  const packageName = "org.example.$App";
  const { command } = buildSpringCommand({ ...settings, groupId }, packageName, []);
  // Stub spring to print its arguments; never invoke the actual CLI or generate files.
  const result = spawnSync("/bin/sh", ["-c", 'spring() { printf "%s\\n" "$@"; }; ' + command], { encoding: "utf8" });
  assert.equal(result.status, 0);
  const args = result.stdout.trimEnd().split("\n");
  assert.ok(args.includes(`--group-id=${groupId}`));
  assert.ok(args.includes(`--package-name=${packageName}`));
});
