import { IdbRepository } from "./idb-repository";
import type { HabitRepository } from "./repository";

export type { HabitRepository } from "./repository";

let repository: HabitRepository | null = null;

/**
 * Repositorio de la app. Es el único sitio que decide qué implementación
 * se usa: para añadir sincronización bastará con cambiar esta función.
 */
export function getRepository(): HabitRepository {
  if (typeof window === "undefined") {
    throw new Error("El repositorio solo está disponible en el navegador");
  }
  repository ??= new IdbRepository();
  return repository;
}
