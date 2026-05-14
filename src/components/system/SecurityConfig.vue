<template>
  <el-form :model="localValue" label-width="150px">
    <el-form-item label="最大登录尝试次数">
      <el-input-number v-model="localValue.security_login_attempts" :min="1" :max="20" />
      <span class="form-tip-inline">次，超过后将暂时锁定账户</span>
    </el-form-item>

    <el-form-item label="JWT过期时间">
      <el-input-number v-model="localValue.security_jwt_expire_hours" :min="1" :max="720" />
      <span class="form-tip-inline">小时</span>
    </el-form-item>

    <el-form-item label="会话超时时间">
      <el-input-number v-model="localValue.security_session_timeout" :min="5" :max="120" />
      <span class="form-tip-inline">分钟</span>
    </el-form-item>

    <el-form-item label="启用验证码">
      <el-switch v-model="localValue.security_enable_captcha" />
      <span class="form-tip-inline">登录时启用图形验证码</span>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: {
    security_login_attempts: number;
    security_jwt_expire_hours: number;
    security_session_timeout: number;
    security_enable_captcha: boolean;
  };
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.form-tip-inline {
  margin-left: 12px;
  color: #909399;
  font-size: 14px;
}
</style>