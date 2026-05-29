import { type HttpClient } from "@erp-digital-printing/http";
import { GetAttributes, CreateAttribute, GetAttributeById, UpdateAttribute, DeleteAttribute } from "@core/attribute/applications/usecases/attribute.usecase";
import { ApiAttributeRepository } from "../repositories/attribute.repository";

export function getAttributeUseCase(http: HttpClient): GetAttributes {
  const repository = new ApiAttributeRepository(http);
  return new GetAttributes(repository);
}

export function createAttributeUseCase(http: HttpClient): CreateAttribute {
  const repository = new ApiAttributeRepository(http);
  return new CreateAttribute(repository);
}

export function getAttributeByIdUseCase(http: HttpClient): GetAttributeById {
  const repository = new ApiAttributeRepository(http);
  return new GetAttributeById(repository);
}

export function updateAttributeUseCase(http: HttpClient): UpdateAttribute {
  const repository = new ApiAttributeRepository(http);
  return new UpdateAttribute(repository);
}

export function deleteAttributeUseCase(http: HttpClient): DeleteAttribute {
  const repository = new ApiAttributeRepository(http);
  return new DeleteAttribute(repository);
}
