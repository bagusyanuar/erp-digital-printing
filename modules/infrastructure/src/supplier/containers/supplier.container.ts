import { type HttpClient } from "@erp-digital-printing/http";
import { GetSuppliers, CreateSupplier, GetSupplierById, UpdateSupplier, DeleteSupplier } from "@core/supplier/applications/usecases/supplier.usecase";
import { ApiSupplierRepository } from "../repositories/supplier.repository";

export function getSupplierUseCase(http: HttpClient): GetSuppliers {
  const repository = new ApiSupplierRepository(http);
  return new GetSuppliers(repository);
}

export function createSupplierUseCase(http: HttpClient): CreateSupplier {
  const repository = new ApiSupplierRepository(http);
  return new CreateSupplier(repository);
}

export function getSupplierByIdUseCase(http: HttpClient): GetSupplierById {
  const repository = new ApiSupplierRepository(http);
  return new GetSupplierById(repository);
}

export function updateSupplierUseCase(http: HttpClient): UpdateSupplier {
  const repository = new ApiSupplierRepository(http);
  return new UpdateSupplier(repository);
}

export function deleteSupplierUseCase(http: HttpClient): DeleteSupplier {
  const repository = new ApiSupplierRepository(http);
  return new DeleteSupplier(repository);
}
