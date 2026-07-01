import type { DashboardRepository } from "../../domains/repositories/dashboard.repository";
import type { DashboardWidgets } from "../../domains/models/dashboard.model";

export class GetDashboardWidgets {
  constructor(private readonly repository: DashboardRepository) {}

  async execute(startDate?: string, endDate?: string): Promise<DashboardWidgets> {
    return await this.repository.getWidgets(startDate, endDate);
  }
}
