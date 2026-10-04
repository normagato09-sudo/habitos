"use client";

import { useEffect, useState } from "react";
import type { Completion, DateKey, Habit } from "@/lib/domain/types";
import { getRepository, type HabitRepository } from "./index";

type QueryState<T> = { data: T | undefined; loading: boolean; error: Error | null };

/**
 * Ejecuta una consulta al repositorio y la repite cada vez que cambian
 * los datos, para que las pantallas estén siempre al día.
 */
function useRepositoryQuery<T>(
  query: (repo: HabitRepository) => Promise<T>,
  key: string,
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const repo = getRepository();
    let cancelled = false;

    const run = () => {
      query(repo).then(
        (data) => !cancelled && setState({ data, loading: false, error: null }),
        (error: unknown) =>
          !cancelled &&
          setState((s) => ({
            ...s,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })),
      );
    };

    run();
    const unsubscribe = repo.subscribe(run);
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // `key` resume los parámetros de la consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

export function useHabits(): QueryState<Habit[]> {
  return useRepositoryQuery((repo) => repo.listHabits(), "habits");
}

export function useCompletions(range?: { from: DateKey; to: DateKey }): QueryState<Completion[]> {
  return useRepositoryQuery(
    (repo) => repo.listCompletions(range),
    range ? `completions:${range.from}:${range.to}` : "completions:all",
  );
}
