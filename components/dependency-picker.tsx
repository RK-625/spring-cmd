"use client";

import { useSpringProject } from "@/components/spring-project-provider";
import { IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { Dependency } from "@/lib/spring";

export function DependencyPicker() {
  const {
    dependencies: { available, selected, added, query, loading, error },
    selectDependency,
    setDependencyQuery,
    addDependency,
    removeDependency,
    retryDependencies,
  } = useSpringProject();

  return (
    <section aria-label="Spring dependencies" className="w-full">
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="dependency" className="sr-only">Search dependencies</FieldLabel>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Combobox
                items={available}
                value={selected}
                onValueChange={selectDependency}
                inputValue={query}
                onInputValueChange={setDependencyQuery}
                itemToStringLabel={(item: Dependency) => item.name}
                itemToStringValue={(item: Dependency) => item.id}
                filter={(item, search) => `${item.name} ${item.id} ${item.description} ${item.group}`.toLowerCase().includes(search.toLowerCase())}
                disabled={loading || !!error}
              >
                <ComboboxInput id="dependency" className="w-full" placeholder={loading ? "Loading dependencies…" : "Search dependencies…"} aria-invalid={!!error} aria-describedby={error ? "dependency-error" : undefined} showClear />
                <ComboboxContent>
                  <ComboboxEmpty>No dependencies found.</ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxGroup>
                    <ComboboxCollection>
                      {(item: Dependency) => (
                        <ComboboxItem key={item.id} value={item}>
                          <div className="flex flex-col gap-1 pr-5">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">{item.description}</span>
                          </div>
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <Button onClick={addDependency} disabled={!selected || loading || !!error}>Add</Button>
          </div>
          {error && (
            <div className="flex items-center gap-2">
              <FieldError id="dependency-error">{error}</FieldError>
              <Button variant="outline" size="sm" onClick={retryDependencies}>Retry</Button>
            </div>
          )}
        </Field>
      </FieldGroup>
      <div aria-live="polite" className="sr-only">{loading ? "Loading dependencies" : `${added.length} dependencies added`}</div>
      {added.length > 0 && (
        <ul aria-label="Added dependencies" className="mt-4 flex flex-wrap gap-2">
          {added.map(dependency => (
            <li key={dependency.id}>
              <Badge variant="secondary" className="h-auto gap-1">
                {dependency.name}
                <Button variant="ghost" size="icon-xs" aria-label={`Remove ${dependency.name}`} onClick={() => removeDependency(dependency.id)}><IconX /></Button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
