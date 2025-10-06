import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEnhancedEntity } from './media-enhanced.entity';
import axios from 'axios';

@Injectable()
export class MediaProcessingService {
  constructor(
    @InjectRepository(MediaEnhancedEntity) private mediaRepo: Repository<MediaEnhancedEntity>,
  ) {}

  async processMedia(mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new Error('Media not found');

    await this.mediaRepo.update(mediaId, { processing_status: 'processing' });

    try {
      switch (media.file_type) {
        case 'video':
          await this.processVideo(media);
          break;
        case 'audio':
          await this.processAudio(media);
          break;
        case 'image':
          await this.processImage(media);
          break;
        case 'document':
          await this.processDocument(media);
          break;
      }

      await this.mediaRepo.update(mediaId, { processing_status: 'completed' });
    } catch (error) {
      await this.mediaRepo.update(mediaId, {
        processing_status: 'failed',
        processing_errors: [error.message]
      });
    }
  }

  private async processVideo(media: MediaEnhancedEntity): Promise<void> {
    // Extract video metadata (would use ffmpeg in production)
    const metadata = {
      duration: 120, // seconds
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'h264'
    };

    // Generate thumbnail
    const thumbnailUrl = `${media.storage_url}_thumbnail.jpg`;

    // Transcribe audio track
    const transcription = await this.transcribeAudio(media.storage_url);

    await this.mediaRepo.update(media.id, {
      metadata,
      thumbnail_url: thumbnailUrl,
      transcription: transcription.text,
      transcription_timestamps: transcription.timestamps
    });
  }

  private async processAudio(media: MediaEnhancedEntity): Promise<void> {
    // Extract audio metadata
    const metadata = {
      duration: 180, // seconds
      bitrate: 320000,
      codec: 'mp3'
    };

    // Transcribe audio
    const transcription = await this.transcribeAudio(media.storage_url);

    await this.mediaRepo.update(media.id, {
      metadata,
      transcription: transcription.text,
      transcription_timestamps: transcription.timestamps
    });
  }

  private async processImage(media: MediaEnhancedEntity): Promise<void> {
    // Extract image metadata and EXIF
    const metadata = {
      width: 3000,
      height: 2000,
      exif: {
        camera: 'Canon EOS',
        dateTaken: '2024-01-15',
        location: { lat: 18.5944, lng: -72.3074 } // Port-au-Prince
      }
    };

    // Extract GPS coordinates from EXIF if available
    if (metadata.exif.location) {
      await this.mediaRepo.update(media.id, {
        latitude: metadata.exif.location.lat,
        longitude: metadata.exif.location.lng
      });
    }

    // Generate thumbnail
    const thumbnailUrl = `${media.storage_url}_thumb.jpg`;

    // Run OCR if the image contains text
    const ocrText = await this.performOCR(media.storage_url);

    await this.mediaRepo.update(media.id, {
      metadata,
      thumbnail_url: thumbnailUrl,
      ocr_text: ocrText
    });
  }

  private async processDocument(media: MediaEnhancedEntity): Promise<void> {
    // Extract text from PDF or other documents
    const ocrText = await this.performOCR(media.storage_url);

    // Generate thumbnail of first page
    const thumbnailUrl = `${media.storage_url}_page1.jpg`;

    await this.mediaRepo.update(media.id, {
      thumbnail_url: thumbnailUrl,
      ocr_text: ocrText
    });
  }

  private async transcribeAudio(audioUrl: string): Promise<{ text: string; timestamps: any }> {
    // In production, integrate with Whisper API or similar
    // For now, mock implementation
    return {
      text: 'Transcribed audio content...',
      timestamps: [
        { start: 0, end: 5, text: 'First segment' },
        { start: 5, end: 10, text: 'Second segment' }
      ]
    };
  }

  private async performOCR(imageUrl: string): Promise<string> {
    // In production, integrate with Tesseract or Google Vision API
    return 'Extracted text from image...';
  }

  async generateSubtitles(mediaId: string, format: 'srt' | 'vtt' = 'srt'): Promise<string> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media || !media.transcription_timestamps) {
      throw new Error('Transcription not available');
    }

    let subtitles = '';
    if (format === 'srt') {
      media.transcription_timestamps.forEach((segment: any, index: number) => {
        subtitles += `${index + 1}\n`;
        subtitles += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
        subtitles += `${segment.text}\n\n`;
      });
    }

    return subtitles;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}
