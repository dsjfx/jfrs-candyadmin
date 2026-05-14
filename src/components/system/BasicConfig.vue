<template>
  <el-form :model="localValue" label-width="120px">
    <el-form-item label="站点名称" required>
      <el-input v-model="localValue.site_name" placeholder="请输入站点名称" />
    </el-form-item>

    <el-form-item label="站点描述">
      <el-input v-model="localValue.site_description" type="textarea" :rows="3" placeholder="请输入站点描述" />
    </el-form-item>

    <el-form-item label="站点关键词">
      <el-select v-model="localValue.site_keywords" multiple filterable allow-create default-first-option
        placeholder="请选择或输入关键词" style="width: 100%">
        <el-option v-for="item in localValue.site_keywords" :key="item" :label="item" :value="item" />
      </el-select>
      <div class="form-tip">支持回车创建新标签，用于SEO优化</div>
    </el-form-item>

    <el-form-item label="ICP备案号">
      <el-input v-model="localValue.site_icp" placeholder="例如：京ICP备12345678号" />
    </el-form-item>

    <el-form-item label="页脚版权信息">
      <el-input v-model="localValue.site_footer" placeholder="请输入页脚版权信息" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: {
    site_name: string;
    site_description: string;
    site_keywords: string[];
    site_icp: string;
    site_footer: string;
  };
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>