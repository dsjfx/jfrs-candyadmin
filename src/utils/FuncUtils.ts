import { Photo, PhotoData } from "@/types/photo";

// Convert Photo objects to PhotoData; 
export function wrapPhotos(photos: Photo[]): PhotoData[] {
  const photoDatas: PhotoData[] = [];
  photos.forEach(photo => {
    const photoData: PhotoData = {
      filename: photo.filename,
      path: photo.path,
      url: photo.url,
      originalname: photo.originalname,
      mimetype: photo.mimetype,
      size: photo.size,
      width: photo.dimensions.width,
      height: photo.dimensions.height,
      thumbnailFilename: photo.thumbnail.filename,
      thumbnailUrl: photo.thumbnail.url,
      thumbnailSize: photo.thumbnail.size,
      thumbnailPath: photo.thumbnail.path,
    };
    photoDatas.push(photoData);
  });

  return photoDatas;
}