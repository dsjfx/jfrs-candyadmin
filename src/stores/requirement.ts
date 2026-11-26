import { ref } from "vue";
import { defineStore } from "pinia";
import { Requirement, RequirementForm, RequirementQueryParams, RequirementStats } from "@/types/requirement";
import { requirementApi } from "@/api/requirement";


export const useRequirementStore = defineStore('requirement', () => {
  const requirements = ref<Requirement[]>([]);
  const total = ref<number>(0);
  const loading = ref<boolean>(false);
  const overviewStats = ref<RequirementStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: ""
  });
  const systems = ref<string[]>([]);

  // 获取需求列表
  const fetchRequirements = async (params?: RequirementQueryParams) => {
    loading.value = true;
    try {
      const response = await requirementApi.getRequirements(params);
      requirements.value = response.records;
      total.value = response.pagination.total;
    } catch (error) {
      console.error('获取需求列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取需求详情
  const fetchRequirementDetail = async (id: string | number): Promise<Requirement | null> => {
    try {
      const response = await requirementApi.getRequirement(id);
      return response;
    } catch (error) {
      console.error('获取需求详情失败:', error);
      return null;
    }
  };

  // 创建需求
  const createRequirement = async (data: RequirementForm) => {
    try {
      const response = await requirementApi.createRequirement(data);
      return response;
    } catch (error) {
      console.error('创建需求失败:', error);
      throw error;
    }
  };

  // 更新需求
  const updateRequirement = async (id: string | number, data: Partial<RequirementForm>) => {
    try {
      const response = await requirementApi.updateRequirement(id, data);
      return response;
    } catch (error) {
      console.error('更新需求失败:', error);
      throw error;
    }
  };

  // 删除需求
  const deleteRequirement = async (id: string | number) => {
    try {
      await requirementApi.deleteRequirement(id);
    } catch (error) {
      console.error('删除需求失败:', error);
      throw error;
    }
  };

  // 批量删除需求
  const batchDeleteRequirements = async (ids: (string | number)[]) => {
    try {
      await requirementApi.batchDelete(ids);
    } catch (error) {
      console.error('批量删除需求失败:', error);
      throw error;
    }
  };

  // 获取需求统计数据
  const getRequirementStats = async () => {
    try {
      const response = await requirementApi.getStats();
      return response;
    } catch (error) {
      console.error('获取需求统计数据失败:', error);
      throw error;
    }
  }

  const getRequirementOverviewStats = async () => {
    try {
      const response = await requirementApi.getOverviewStats();
      overviewStats.value = response as RequirementStats;
      return response;
    } catch (error) {
      console.error('获取需求概览统计数据失败:', error);
      throw error;
    }
  }

  const getRequirementSystems = async () => {
    try {
      const response = await requirementApi.getSystems();
      console.log('获取需求系统列表成功:', response);
      systems.value = response as string[];
      return response;
    } catch (error) {
      console.error('获取需求系统列表失败:', error);
      throw error;
    }
  }

  return {
    requirements,
    total,
    loading,
    overviewStats,
    systems,

    fetchRequirements,
    fetchRequirementDetail,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    batchDeleteRequirements,
    getRequirementStats,
    getRequirementOverviewStats,
    getRequirementSystems,
  };
});