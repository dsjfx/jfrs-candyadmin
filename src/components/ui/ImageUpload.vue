<template>
  <div class="image-upload">
    <!-- 图片预览 -->
    <div v-if="modelValue" class="image-preview">
      <img :src="modelValue" alt="封面图" @click="handlePreview" />
      <div class="image-actions">
        <el-tooltip content="预览" placement="top">
          <el-button size="small" circle @click="handlePreview">
            <el-icon>
              <ZoomIn />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="替换" placement="top">
          <el-button size="small" circle type="primary" @click="triggerUpload">
            <el-icon>
              <Refresh />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <el-button size="small" circle type="danger" @click="handleRemove">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 上传区域 -->
    <label v-else class="upload-area" @click.stop="triggerUpload" @touchstart.stop="handleTouchStart">
      <el-icon class="upload-icon">
        <Plus />
      </el-icon>
      <span class="upload-text">点击上传图片</span>
      <span class="upload-tip">支持 JPG、PNG、GIF，大小不超过 {{ maxSize }}MB</span>

      <!-- 隐藏的文件输入 -->
      <input ref="fileInput" type="file" :accept="accept" class="file-input-hidden" @change="handleFileChange"
        @click.stop />
    </label>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px" append-to-body destroy-on-close>
      <div class="preview-container">
        <img :src="modelValue" alt="预览" />
      </div>
    </el-dialog>

    <!-- 上传进度对话框 -->
    <el-dialog v-model="progressVisible" title="上传中" width="400px" :close-on-click-modal="false" :show-close="false"
      append-to-body>
      <div class="progress-container">
        <el-progress :percentage="uploadProgress" :status="uploadStatus" :stroke-width="10" />
        <p class="progress-text" v-if="uploadStatus === 'success'">
          上传成功！
        </p>
        <p class="progress-text" v-else-if="uploadStatus === 'exception'">
          上传失败，请重试
        </p>
        <p class="progress-text" v-else>
          正在上传... {{ uploadProgress }}%
        </p>
      </div>
      <template #footer>
        <el-button @click="closeDialog">
          关闭
        </el-button>
        <el-button v-if="uploadStatus === 'exception'" @click="retryUpload">
          重试
        </el-button>
        <el-button v-if="uploadStatus === 'success'" type="primary" @click="progressVisible = false">
          完成
        </el-button>
      </template>
    </el-dialog>

    <!-- 裁剪对话框 -->
    <el-dialog v-model="cropVisible" title="图片裁剪" width="600px" append-to-body destroy-on-close
      @closed="handleCropClosed">
      <div class="crop-container">
        <div class="crop-image">
          <img ref="cropImageRef" :src="cropImageSrc" alt="裁剪图片" />
        </div>
        <div class="crop-options">
          <el-radio-group v-model="cropAspect">
            <el-radio-button value="free">自由</el-radio-button>
            <el-radio-button value="1:1">1:1</el-radio-button>
            <el-radio-button value="4:3">4:3</el-radio-button>
            <el-radio-button value="16:9">16:9</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="cropVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm">确认裁剪</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Refresh, ZoomIn } from '@element-plus/icons-vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { Photo } from '@/types/photo'

interface Props {
  modelValue?: string
  accept?: string
  maxSize?: number
  enableCrop?: boolean
  cropAspect?: string
  uploadUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  accept: 'image/jpeg,image/png,image/gif,image/webp',
  maxSize: 5, // MB
  enableCrop: true,
  cropAspect: 'free',
  uploadUrl: '/upload/file'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'upload-start': []
  'upload-progress': [percent: number]
  'upload-success': [photo: Photo]
  'upload-error': [error: Error]
}>()

// 状态
const fileInput = ref<HTMLInputElement>()
const previewVisible = ref(false)
const progressVisible = ref(false)
const cropVisible = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<"" | "success" | "exception" | "warning">("")
const cropImageRef = ref<HTMLImageElement>()
const cropImageSrc = ref('')
const cropAspect = ref(props.cropAspect)
let cropper: Cropper | null = null

// 当前上传的文件
let currentFile: File | null = null

// 触发文件选择
const triggerUpload = (event?: Event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }

  fileInput.value?.click()
}

// 移动端触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 创建新的 input 元素（解决移动端重复点击问题）
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = props.accept
  input.style.display = 'none'

  // 监听 change 事件
  input.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
      if (!handleFile(file)) {
        input.value = ''
        return
      }

      uploadFile(file)
    }

    // 清理 input 元素
    document.body.removeChild(input)
  })

  // 添加到 body 并触发点击
  document.body.appendChild(input)
  input.click()
}

// 处理文件（从 input 或直接调用）
const handleFile = (file: File): boolean => {
  // 检查文件类型
  const acceptedTypes = props.accept.split(',')
  const fileType = file.type
  if (!acceptedTypes.some(type => fileType.match(type.trim()))) {
    ElMessage.error('不支持的文件类型')
    return false
  }

  // 检查文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  currentFile = file
  return true
}

// 处理文件选择
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // 检查文件类型
  // const acceptedTypes = props.accept.split(',')
  // const fileType = file.type
  // if (!acceptedTypes.some(type => fileType.match(type))) {
  //   ElMessage.error('不支持的文件类型')
  //   input.value = ''
  //   return
  // }

  // // 检查文件大小
  // if (file.size > props.maxSize * 1024 * 1024) {
  //   ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
  //   input.value = ''
  //   return
  // }

  // currentFile = file
  if (!handleFile(file)) {
    input.value = ''
    return
  }

  // 如果需要裁剪，打开裁剪对话框
  if (props.enableCrop) {
    const reader = new FileReader()
    reader.onload = (e) => {
      cropImageSrc.value = e.target?.result as string
      cropVisible.value = true
    }
    reader.readAsDataURL(file)
  } else {
    // 直接上传
    uploadFile(file)
  }

  // 清空input，允许重新选择同一个文件
  input.value = ''
}

// 初始化裁剪器
const initCropper = () => {
  if (!cropImageRef.value) return

  if (cropper) {
    cropper.destroy()
  }

  cropper = new Cropper(cropImageRef.value, {
    viewMode: 1,
    dragMode: 'move',
    aspectRatio: getAspectRatio(cropAspect.value),
    autoCropArea: 0.8,
    cropBoxMovable: true,
    cropBoxResizable: true,
    guides: true,
    center: true,
    highlight: true,
    background: true
  })
}

// 获取裁剪比例
const getAspectRatio = (aspect: string): number => {
  switch (aspect) {
    case '1:1':
      return 1
    case '4:3':
      return 4 / 3
    case '16:9':
      return 16 / 9
    default:
      return NaN
  }
}

// 裁剪对话框关闭时
const handleCropClosed = () => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  cropImageSrc.value = ''
}

// 确认裁剪
const handleCropConfirm = async () => {
  if (!cropper || !currentFile) return

  try {
    // 获取裁剪后的 canvas
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 1920,
      maxHeight: 1080,
      fillColor: '#fff'
    })

    // 转换为 Blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, currentFile!.type)
    })

    // 创建新的 File 对象
    const croppedFile = new File([blob], currentFile.name, {
      type: currentFile.type
    })

    // 关闭裁剪对话框
    cropVisible.value = false

    // 上传裁剪后的文件
    uploadFile(croppedFile)
  } catch (error) {
    console.error('裁剪失败:', error)
    ElMessage.error('图片裁剪失败')
  }
}

// 上传文件
const uploadFile = (file: File) => {
  progressVisible.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''
  emit('upload-start')

  // 创建 FormData
  const formData = new FormData()
  formData.append('file', file)

  // 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest()

  // 监听上传进度
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded * 100) / e.total)
      uploadProgress.value = percent
      emit('upload-progress', percent)
    }
  })

  // 监听请求完成
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText)
        const imageUrl = response.data?.url || response.url

        if (imageUrl) {
          uploadStatus.value = 'success'
          emit('update:modelValue', imageUrl)
          emit('change', imageUrl)
          emit('upload-success', response.data)

          // 延迟关闭对话框，让用户看到成功状态
          setTimeout(() => {
            progressVisible.value = false
          }, 1000)
        } else {
          throw new Error('上传响应格式错误')
        }
      } catch (error) {
        handleUploadError(error as Error)
      }
    } else {
      handleUploadError(new Error(`上传失败 (${xhr.status})`))
    }
  })

  // 监听错误
  xhr.addEventListener('error', () => {
    handleUploadError(new Error('网络错误，上传失败'))
  })

  xhr.addEventListener('abort', () => {
    handleUploadError(new Error('上传已取消'))
  })

  const baseUrl = import.meta.env.VITE_API_BASE_URL
  // 发送请求
  xhr.open('POST', baseUrl + props.uploadUrl)
  xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  xhr.send(formData)
}

// 处理上传错误
const handleUploadError = (error: Error) => {
  uploadStatus.value = 'exception'
  emit('upload-error', error)
  ElMessage.error(error.message)
}

const closeDialog = () => {
  progressVisible.value = false
}

// 重试上传
const retryUpload = () => {
  if (currentFile) {
    uploadFile(currentFile)
  }
}

// 处理预览
const handlePreview = () => {
  previewVisible.value = true
}

// 处理删除
const handleRemove = () => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    type: 'warning'
  }).then(() => {
    emit('update:modelValue', '')
    emit('change', '')
    currentFile = null
    ElMessage.success('已删除')
  }).catch(() => { })
}

// 监听裁剪比例变化
watch(cropAspect, (newVal) => {
  if (cropper) {
    cropper.setAspectRatio(getAspectRatio(newVal))
  }
})

// 监听图片加载完成，初始化裁剪器
watch(cropImageSrc, (newVal) => {
  if (newVal) {
    // 等待 DOM 更新
    setTimeout(() => {
      initCropper()
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.image-upload {
  .image-preview {
    position: relative;
    width: 100%;
    height: 300px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    background: #f5f7fa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .image-actions {
      position: absolute;
      bottom: 10px;
      right: 10px;
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;

      .el-button {
        width: 32px;
        height: 32px;
        padding: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        .el-icon {
          font-size: 16px;
        }
      }
    }

    &:hover .image-actions {
      opacity: 1;
    }

    // 移动端始终显示操作按钮
    @media (max-width: $breakpoint-mobile) {
      .image-actions {
        opacity: 1;
        background: rgba(255, 255, 255, 0.9);
        padding: 5px;
        border-radius: 8px;
      }
    }
  }

  .upload-area {
    width: 100%;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 4px;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      background: #ecf5ff;

      .upload-icon {
        color: #409eff;
      }
    }

    .upload-icon {
      font-size: 32px;
      color: #909399;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
      color: #606266;
      margin-bottom: 4px;
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  // 隐藏的文件输入
  .file-input-hidden {
    position: absolute;
    width: auto;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;

    // 移动端确保可点击区域足够大
    @media (max-width: $breakpoint-mobile) {
      min-height: 44px;
      min-width: 44px;
    }
  }
}


.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 600px;
  overflow: auto;

  img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
  }
}

.progress-container {
  text-align: center;
  padding: 20px 0;

  .progress-text {
    margin-top: 16px;
    font-size: 14px;
    color: #606266;
  }
}

.crop-container {
  .crop-image {
    max-height: 400px;
    overflow: hidden;

    img {
      max-width: 100%;
    }
  }

  .crop-options {
    margin-top: 20px;
    text-align: center;
  }
}
</style>