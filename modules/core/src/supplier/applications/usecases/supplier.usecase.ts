import type { SupplierRepository } from "../../domains/repositories";
import type { SupplierModel } from "../../domains/models";
import type { SupplierParams, CreateSupplierInput } from "../inputs";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetSuppliers {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(
    params: SupplierParams,
  ): Promise<PaginatedResponse<SupplierModel>> {
    return await this.supplierRepository.getSuppliers(params);
  }
}

export class GetSupplierById {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(id: string): Promise<SupplierModel> {
    return await this.supplierRepository.getSupplierById(id);
  }
}

export class CreateSupplier {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(input: CreateSupplierInput): Promise<SupplierModel> {
    return await this.supplierRepository.create(input);
  }
}

export class UpdateSupplier {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(id: string, input: CreateSupplierInput): Promise<SupplierModel> {
    return await this.supplierRepository.update(id, input);
  }
}

export class DeleteSupplier {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(id: string): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
