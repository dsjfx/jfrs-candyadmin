// Utility to compress images when file size exceeds threshold.
// Strategy: load image into canvas, attempt quality-based compression first (for JPEG/WEBP),
// then downscale dimensions progressively if still larger than target. Keep minimal quality and dimensions.

export interface CompressOptions {
    maxSizeMB?: number // target max size in megabytes
    minQuality?: number // minimum jpeg/webp quality to try
    stepQuality?: number // quality decrement step
    minWidth?: number // don't scale below this width
    minHeight?: number // don't scale below this height
    outputType?: string // 'image/jpeg' | 'image/webp' | 'image/png'
}

export interface CompressResult {
    blob: Blob
    file: File
}

function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
    })
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
        // handle CORS images
        img.crossOrigin = 'anonymous'
        img.src = src
    })
}

async function dataURLToBlob(dataURL: string): Promise<Blob> {
    const res = await fetch(dataURL)
    return await res.blob()
}

export async function compressImageFile(file: File, options?: CompressOptions): Promise<CompressResult> {
    const opts: Required<CompressOptions> = {
        maxSizeMB: options?.maxSizeMB ?? 3,
        minQuality: options?.minQuality ?? 0.6,
        stepQuality: options?.stepQuality ?? 0.05,
        minWidth: options?.minWidth ?? 800,
        minHeight: options?.minHeight ?? 600,
        outputType: options?.outputType ?? 'image/jpeg'
    }

    // if below threshold, return original
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB <= opts.maxSizeMB) {
        return { blob: file, file }
    }

    const dataUrl = await readFileAsDataURL(file)
    const img = await loadImage(dataUrl)

    // initial canvas dimensions
    const width = img.width
    const height = img.height

    // create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // helper to export current canvas to blob with quality
    async function exportBlob(quality: number): Promise<Blob> {
        // prefer outputType for JPEG/WEBP; PNG is lossless and won't shrink much
        const mime = opts.outputType
        // use toDataURL then convert for broader support
        const dataUrl = canvas.toDataURL(mime, quality)
        return dataURLToBlob(dataUrl)
    }

    // step 1: try compressing by quality only if image type supports it
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)

    let quality = 0.95
    let blob = await exportBlob(quality)

    // if initial export is already small enough, return
    const targetBytes = opts.maxSizeMB * 1024 * 1024
    if (blob.size <= targetBytes) {
        const outFile = new File([blob], file.name, { type: blob.type })
        return { blob, file: outFile }
    }

    // decrease quality iteratively until minQuality
    while (quality > opts.minQuality) {
        quality = Math.max(opts.minQuality, quality - opts.stepQuality)
        blob = await exportBlob(quality)
        if (blob.size <= targetBytes) {
            const outFile = new File([blob], file.name, { type: blob.type })
            return { blob, file: outFile }
        }
    }

    // step 2: downscale dimensions progressively while keeping quality at minQuality
    // avoid scaling below minWidth/minHeight
    let scale = 0.9
    let currentWidth = width
    let currentHeight = height
    while ((blob.size > targetBytes) && (currentWidth > opts.minWidth && currentHeight > opts.minHeight)) {
        currentWidth = Math.max(opts.minWidth, Math.floor(currentWidth * scale))
        currentHeight = Math.max(opts.minHeight, Math.floor(currentHeight * scale))

        canvas.width = currentWidth
        canvas.height = currentHeight
        // draw scaled image
        ctx.clearRect(0, 0, currentWidth, currentHeight)
        ctx.drawImage(img, 0, 0, currentWidth, currentHeight)

        // export with minQuality
        blob = await exportBlob(opts.minQuality)
        if (blob.size <= targetBytes) {
            const outFile = new File([blob], file.name, { type: blob.type })
            return { blob, file: outFile }
        }

        // slow down further scaling to avoid quality loss too fast
        scale -= 0.05
        if (scale <= 0.5) scale = 0.5

        // break if already at minimal dimensions
        if (currentWidth <= opts.minWidth || currentHeight <= opts.minHeight) break
    }

    // final fallback: return best effort compressed blob
    const outFile = new File([blob], file.name, { type: blob.type })
    return { blob, file: outFile }
}
