export interface Photo {
	dimensions: Dimension;
	filename: string;
	mimetype: string;
	originalname: string;
	path: string;
	size: number;
	thumbnail: Thumbnail;
	url: string;
	photoType: string;	//avatar, cover, gallery
}

interface Dimension {
	width: number;
	height: number;
}

interface Thumbnail {
	filename: string;
	path: string;
	size: number;
	url: string;
}

export interface PhotoData {
  filename: string;
  path: string;
  url: string;
  originalname: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  thumbnailFilename?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  thumbnailSize?: number;
  sortOrder?: number;
  isCover?: boolean;
  description?: string;
  tags?: string;
  photoType?: string; //图片类型(avatar, cover, gallery)
}