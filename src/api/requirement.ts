import request from './index';
import { CODE_RE, makeUrl } from "./base";
import { Requirement, RequirementForm, RequirementQueryParams } from "@/types/requirement";

function requirementUrl(url: string = ''): string {
  return makeUrl(CODE_RE, url);
}

export const requirementApi = {
  // 获取需求列表
  getRequirements(params?: RequirementQueryParams) {
    return request.get(requirementUrl('/list'), params);
  },

  // 获取需求详情
  getRequirement(id: string | number): Promise<Requirement> {
    return request.get(requirementUrl(`/view/${id}`));
  },

  // 创建需求
  createRequirement(data: RequirementForm) {
    return request.post(requirementUrl(''), data);
  },
  // 更新需求
  updateRequirement(id: string | number, data: Partial<RequirementForm>) {
    return request.put(requirementUrl(`/${id}`), data);
  },

  // 删除需求
  deleteRequirement(id: string | number) {
    return request.delete(requirementUrl(`/${id}`));
  },

  // 批量删除
  batchDelete(ids: (string | number)[]) {
    return request.delete(requirementUrl('/batch'), { data: { ids } });
  },

  // 获取需求统计数据
  getStats() {
    return request.get(requirementUrl('/stats'));
  },

  getOverviewStats() {
    return request.get(requirementUrl('/overview-stats'));
  },

  getSystems() {
    return request.get(requirementUrl('/systems'));
  }
};