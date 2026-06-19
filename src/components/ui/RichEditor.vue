<template>
  <div class="rich-editor">
    <!-- 使用 Quill 编辑器 -->
    <!-- <ClientOnly> -->
    <QuillEditor ref="quillRef" v-model:content="content" :options="editorOptions" :content-type="contentType"
      :placeholder="placeholder" :read-only="readonly" @update:content="handleUpdate" @focus="handleFocus"
      @blur="handleBlur" @ready="handleReady" class="quill-editor" />
    <!-- </ClientOnly> -->

    <!-- 隐藏的文件上传输入框 -->
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileUpload" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { QuillEditor, Quill } from '@vueup/vue-quill'
import { ElMessage } from 'element-plus'
import '@vueup/vue-quill/dist/vue-quill.snow.css' // 雪碧主题
// import '@vueup/vue-quill/dist/vue-quill.bubble.css' // 气泡主题
import request from '../../api/index';
import { compressImageFile } from '@/utils/imageCompress'

// 如果是 Nuxt 项目，需要 ClientOnly 包装
// 如果是普通 Vue 项目，可以直接使用 QuillEditor，不需要 ClientOnly

interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
  height?: string
  theme?: 'snow' | 'bubble' // 主题
  uploadUrl?: string // 图片上传接口地址
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  readonly: false,
  height: '300px',
  theme: 'snow',
  uploadUrl: '/api/upload' // 默认上传接口
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': []
  'blur': []
  'ready': []
  'image-upload': [file: File]
  'image-uploaded': [url: string]
  'image-error': [error: Error]
}>()

const quillRef = ref()
const editorReady = ref(false)
const pendingContent = ref('')

const fileInput = ref<HTMLInputElement>()
// 内容类型（HTML 或文本）
type ContentType = "delta" | "html" | "text"
const contentType = ref<ContentType>('html')

// 编辑器内容
const content = ref(props.modelValue)

// 自定义字体大小配置
const CustomSize = Quill.import('attributors/style/size')
// 定义可用的字体大小
CustomSize.whitelist = [
  '12px', '14px', '16px', '18px',
  '20px', '24px', '30px', '36px', '48px'
]
Quill.register(CustomSize, true)

// 注册字体
const Font = Quill.import('attributors/style/font')
Font.whitelist = ['simsun', 'microsoft yahei', 'Arial', 'Tahoma', 'Verdana']
Quill.register(Font, true)

// 编辑器选项
const editorOptions = computed(() => ({
  theme: props.theme,
  placeholder: props.placeholder,
  readOnly: props.readonly,
  modules: {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': CustomSize.whitelist }],
        [{ 'font': Font.whitelist }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        'image': imageHandler // 自定义图片处理
      }
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: false
    }
  },
  bounds: document.body,
  scrollingContainer: null,
  debug: 'warn'
}))

// 提示文本映射表
const tooltipMap = {
  'ql-bold': '加粗 (Ctrl+B)',
  'ql-italic': '斜体 (Ctrl+I)',
  'ql-underline': '下划线 (Ctrl+U)',
  'ql-strike': '删除线',
  'ql-blockquote': '引用',
  'ql-code-block': '代码块',
  'ql-header': '标题',
  'ql-list': '列表',
  'ql-script': '上下标',
  'ql-indent': '缩进',
  'ql-direction': '文字方向',
  'ql-size': '字体大小',
  'ql-color': '文字颜色',
  'ql-background': '背景色',
  'ql-font': '字体',
  'ql-align': '对齐方式',
  'ql-clean': '清除格式',
  'ql-link': '插入链接 (Ctrl+K)',
  'ql-image': '插入图片',
  'ql-video': '插入视频',
  'ql-formula': '公式'
};

// 添加 tooltip 的函数
const addTooltips = () => {
  const toolbar = document.querySelector('.ql-toolbar');
  if (!toolbar) return;

  const buttons = toolbar.querySelectorAll('button, .ql-picker');
  buttons.forEach(btn => {
    // 避免重复添加
    if (btn.hasAttribute('data-title-added')) return;

    // 查找匹配的类名
    for (const [className, tooltip] of Object.entries(tooltipMap)) {
      if (btn.classList.contains(className)) {
        btn.setAttribute('title', tooltip);
        btn.setAttribute('data-title-added', 'true');
        break;
      }
    }
  });
};

// 自定义图片处理
const imageHandler = () => {
  // 触发文件选择
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 检查文件大小（限制为 5MB）
  // We'll attempt compression for larger files but still enforce a hard limit
  const hardLimit = 10 * 1024 * 1024 // 10MB hard limit for raw files
  if (file.size > hardLimit) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  let fileToUpload: File = file
  try {
    const threeMB = 3 * 1024 * 1024
    if (file.size > threeMB) {
      ElMessage.info('图片较大，正在尝试压缩，请稍候...')
      const { file: compressed, blob } = await compressImageFile(file, {
        maxSizeMB: 3,
        minQuality: 0.7,
        stepQuality: 0.05,
        minWidth: 1000,
        minHeight: 600,
        outputType: file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      })
      if (blob.size < file.size) {
        fileToUpload = compressed
      }
    }
  } catch (err) {
    console.debug('compress failed', err)
    ElMessage.warning('图片压缩失败，将上传原图')
  }

  emit('image-upload', file)

  try {
  // 上传图片 (use compressed file when available)
  const imageUrl = await uploadImage(fileToUpload)

    // 插入图片到编辑器
    const quill = quillRef.value?.getQuill()
    if (quill) {
      const range = quill.getSelection()
      quill.insertEmbed(range.index, 'image', imageUrl)
    }

    emit('image-uploaded', imageUrl)
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
    emit('image-error', error as Error)
  } finally {
    // 清空 input，允许重新选择同一个文件
    input.value = ''
  }
}

// 上传图片到服务器
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  // // 获取认证 token
  // const token = localStorage.getItem('access_token')

  const result = await request.upload(file, '/file')
  // const response = await fetch(props.uploadUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   },
  //   body: formData
  // })

  if (!result || !result.url) {
    throw new Error(`上传失败: ${result.statusText}`)
  }

  // 根据您的 API 响应格式调整
  return result.url
}

onMounted(async () => {
  // console.log('组件挂载完成')
});

// 监听 props.modelValue 变化
watch(() => props.modelValue, async (newValue/*, oldValue*/) => {
  // if (newValue !== content.value) {
  //   content.value = newValue
  // }
  if (newValue) {
    if (editorReady.value) {
      // 等待下一次 DOM 更新
      await nextTick()
      setEditorContent(newValue)
    } else {
      pendingContent.value = newValue
    }
  }
}, { immediate: true })

// 处理内容更新
const handleUpdate = (value: string) => {
  content.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 处理焦点
const handleFocus = () => {
  emit('focus')
}

// 处理失焦
const handleBlur = () => {
  emit('blur')
}

// 编辑器准备就绪
const handleReady = () => {
  // console.log('编辑器就绪')
  editorReady.value = true
  emit('ready')

  // 如果有待设置的内容，现在设置
  if (pendingContent.value) {
    setEditorContent(pendingContent.value)
  } else if (props.modelValue) {
    setEditorContent(props.modelValue)
  }
  // 延迟确保 DOM 完全渲染
  setTimeout(addTooltips, 100);
  // 自定义下拉框显示文本
  // setTimeout(() => {
  //   const sizeSelects = document.querySelectorAll('.ql-size');
  //   sizeSelects.forEach(sizeSelect => {
  //     if (sizeSelect) {
  //       // 修改下拉框选项的显示文本
  //       const options = sizeSelect.querySelectorAll('option');
  //       if (options.length <= 0) return;
  //       const sizeMap: Record<string, string> = {
  //         '12px': '12px',
  //         '14px': '14px',
  //         '16px': '16px',
  //         '18px': '18px',
  //         '20px': '20px',
  //         '24px': '24px',
  //         '30px': '30px',
  //         '36px': '36px',
  //         '48px': '48px',
  //         'false': '正常'
  //       };

  //       options.forEach(option => {
  //         if (sizeMap[option.value]) {
  //           option.textContent = sizeMap[option.value];
  //         }
  //       });
  //     }
  //   })
  // }, 100);
}

// 设置编辑器内容
const setEditorContent = async (content: string) => {
  if (!quillRef.value) {
    console.log('编辑器引用不存在，保存待设置内容')
    pendingContent.value = content
    return
  }

  const quill = quillRef.value.getQuill()
  if (!quill) {
    console.log('Quill 实例不存在')
    return
  }

  try {
    // console.log('准备设置编辑器内容，长度:', content.length)

    // 使用 nextTick 确保 DOM 已更新
    await nextTick()

    // 检查当前内容是否已是最新
    if (quill.root.innerHTML !== content) {
      quill.clipboard.dangerouslyPasteHTML(content)
      // console.log('内容设置成功')
    } else {
      // console.log('内容已是最新，无需设置')
    }
  } catch (error) {
    console.error('设置内容失败:', error)
  }
}

// 公开方法
defineExpose({
  // 获取内容
  getContent: () => content.value,

  // 获取纯文本
  getText: () => {
    // 需要访问 Quill 实例才能获取纯文本
    // 这里简化处理
    return content.value.replace(/<[^>]+>/g, '')
  },

  // 清空内容
  clear: () => {
    content.value = ''
    emit('update:modelValue', '')
    emit('change', '')
  },

  // 插入内容
  insertContent: (html: string) => {
    content.value += html
    emit('update:modelValue', content.value)
    emit('change', content.value)
  }
})
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;

  :deep(.ql-toolbar) {
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid #dcdfe6;
    background: #f5f7fa;
    font-family: inherit;

    // 自定义工具栏按钮样式
    .ql-formats {
      button {
        &:hover {
          color: #409eff;

          .ql-stroke {
            stroke: #409eff;
          }

          .ql-fill {
            fill: #409eff;
          }
        }

        &.ql-active {
          color: #409eff;

          .ql-stroke {
            stroke: #409eff;
          }

          .ql-fill {
            fill: #409eff;
          }
        }
      }
    }

    .ql-picker.ql-size .ql-picker-label::before,
    .ql-picker.ql-size .ql-picker-item::before {
      content: attr(data-value) !important;
    }

    /* 自定义字体下拉框样式 */
    .ql-picker.ql-font .ql-picker-label::before,
    .ql-picker.ql-font .ql-picker-item::before {
      content: attr(data-value) !important;
    }
  }

  :deep(.quill-editor.ql-container) {
    // display: flex;
    // flex-direction: column;
    min-height: 200px;
    max-height: v-bind('props.height');
    border: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    overflow-y: auto;

    .ql-editor {
      // min-height: 200px;
      padding: 16px;

      &.ql-blank::before {
        color: #c0c4cc;
        font-style: normal;
        left: 16px;
        right: 16px;
      }

      h1 {
        font-size: 24px;
        margin: 20px 0 10px;
      }

      h2 {
        font-size: 20px;
        margin: 18px 0 9px;
      }

      h3 {
        font-size: 16px;
        margin: 16px 0 8px;
      }

      p {
        margin: 10px 0;
      }

      a {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      img {
        max-width: 100%;
        height: auto;
        display: inline-block;
      }

      blockquote {
        border-left: 4px solid #e4e7ed;
        padding-left: 16px;
        margin: 16px 0;
        color: #666;
      }

      pre {
        padding: 16px;
        background: #f6f8fa;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        font-size: 13px;
        font-family: 'Consolas', 'Monaco', monospace;
        color: #e96900;
      }

      code {
        background: #f6f8fa;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 90%;
        color: #e96900;
      }
    }
  }
}

// /* 调整按钮组样式 */
// :deep(.ql-formats) {
//   margin-bottom: 4px;
//   display: inline-flex;
// }

// 全屏模式样式
// .fullscreen {
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: 9999;
//   background: #fff;

//   :deep(.quill-editor) {
//     height: 100vh;

//     .ql-container {
//       max-height: calc(100vh - 42px) !important;
//     }
//   }
// }

// 响应式设计
@media (max-width: 768px) {
  .rich-editor {
    :deep(.ql-toolbar) {
      overflow-x: auto;
      overflow-y: hidden;
      white-space: normal;

      .ql-formats {
        display: inline-block;
        float: none;
      }
    }
  }
}
</style>
