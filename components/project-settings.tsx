"use client";

import { useSpringProject } from "@/components/spring-project-provider";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProjectChoice } from "@/lib/spring";

function ChoiceField({
  label,
  id,
  options,
  value,
  onChange,
}: {
  label: string;
  id: string;
  options: ProjectChoice;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      <ToggleGroup
        aria-labelledby={`${id}-label`}
        variant="outline"
        value={[value]}
        onValueChange={(values) => {
          if (values.length) onChange(values[0] as string);
        }}
        className="max-w-full flex-wrap"
      >
        {options.values.map((option) => (
          <ToggleGroupItem key={option.id} value={option.id}>
            {option.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

export function ProjectSettings() {
  const {
    project: { options, settings, error, packageName },
    updateSetting: update,
    setCustomPackage,
    retryProject,
  } = useSpringProject();

  if (error) {
    return (
      <FieldGroup>
        <FieldError>{error}</FieldError>
        <Button variant="outline" className="self-start" onClick={retryProject}>Retry</Button>
      </FieldGroup>
    );
  }

  if (!options || !settings) {
    return <p role="status" className="text-muted-foreground">Loading project settings…</p>;
  }

  return (
    <section aria-label="Project settings" className="w-full">
      <FieldGroup>
        <ChoiceField label="Project" id="project-type" options={options.type} value={settings.type} onChange={(value) => update("type", value)} />
        <ChoiceField label="Language" id="project-language" options={options.language} value={settings.language} onChange={(value) => update("language", value)} />
        <Field>
          <FieldLabel htmlFor="boot-version">Spring Boot</FieldLabel>
          <Select value={settings.bootVersion} onValueChange={(value) => {
            if (value) update("bootVersion", value);
          }} items={options.bootVersion.values.map((option) => ({ value: option.id, label: option.name }))}>
            <SelectTrigger id="boot-version" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.bootVersion.values.map((option) => (
                  <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <FieldSet>
          <FieldLegend>Project Metadata</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="group-id">Group</FieldLabel>
              <Input id="group-id" value={settings.groupId} onChange={(event) => update("groupId", event.target.value)} spellCheck={false} />
            </Field>
            <Field>
              <FieldLabel htmlFor="artifact-id">Artifact</FieldLabel>
              <Input id="artifact-id" value={settings.artifactId} onChange={(event) => update("artifactId", event.target.value)} spellCheck={false} />
            </Field>
            <Field>
              <FieldLabel htmlFor="package-name">Package name</FieldLabel>
              <Input id="package-name" value={packageName} onChange={(event) => setCustomPackage(event.target.value)} spellCheck={false} />
            </Field>
            <ChoiceField label="Packaging" id="packaging" options={options.packaging} value={settings.packaging} onChange={(value) => update("packaging", value)} />
            <ChoiceField label="Configuration" id="configuration" options={options.configurationFileFormat} value={settings.configurationFileFormat} onChange={(value) => update("configurationFileFormat", value)} />
            <ChoiceField label="Java" id="java-version" options={options.javaVersion} value={settings.javaVersion} onChange={(value) => update("javaVersion", value)} />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </section>
  );
}
