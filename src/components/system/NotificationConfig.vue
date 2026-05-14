<template>
  <el-form :model="localValue" label-width="180px">
    <el-form-item label="评论邮件通知">
      <el-switch v-model="localValue.notification_email_on_comment" />
      <span class="form-tip-inline">有新评论时发送邮件通知</span>
    </el-form-item>

    <el-form-item label="新用户注册通知">
      <el-switch v-model="localValue.notification_email_on_register" />
      <span class="form-tip-inline">有新用户注册时发送邮件通知</span>
    </el-form-item>

    <el-form-item label="管理员邮箱" required>
      <el-input v-model="localValue.notification_admin_email" placeholder="请输入管理员邮箱" style="width: 300px" />
      <div class="form-tip">用于接收系统通知，多个邮箱用英文逗号分隔</div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: {
    notification_email_on_comment: boolean;
    notification_email_on_register: boolean;
    notification_admin_email: string;
  };
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>