import { useDI } from "../../shared/di/DIContext";
import type { GetAttributeUseCases } from "../../shared/di/DIContext";

/**
 * useAttributeDI
 * Selector hook untuk mengambil use cases khusus modul Atribut.
 */
export const useAttributeDI = (): GetAttributeUseCases => useDI().attribute;
