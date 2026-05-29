import type { AttributeRepository } from "../../domains/repositories";
import type { AttributeModel } from "../../domains/models";
import type { AttributeParams, CreateAttributeInput } from "../inputs";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetAttributes {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(
    params: AttributeParams,
  ): Promise<PaginatedResponse<AttributeModel>> {
    return await this.attributeRepository.getAttributes(params);
  }
}

export class GetAttributeById {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(id: string): Promise<AttributeModel> {
    return await this.attributeRepository.getAttributeById(id);
  }
}

export class CreateAttribute {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(input: CreateAttributeInput): Promise<AttributeModel> {
    return await this.attributeRepository.create(input);
  }
}

export class UpdateAttribute {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(id: string, input: CreateAttributeInput): Promise<AttributeModel> {
    return await this.attributeRepository.update(id, input);
  }
}

export class DeleteAttribute {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(id: string): Promise<void> {
    await this.attributeRepository.delete(id);
  }
}
