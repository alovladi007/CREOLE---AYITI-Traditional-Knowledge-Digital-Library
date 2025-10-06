import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('media_enhanced')
export class MediaEnhancedEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column()
  mime_type: string;

  @Column()
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';

  @Column({ type: 'bigint' })
  file_size: number;

  @Column()
  storage_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column()
  sha256_hash: string;

  // Media-specific metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    duration?: number; // for video/audio
    width?: number; // for images/videos
    height?: number;
    fps?: number; // for videos
    bitrate?: number; // for audio/video
    codec?: string;
    exif?: any; // for images
  };

  // Transcription/OCR results
  @Column({ type: 'text', nullable: true })
  transcription: string;

  @Column({ type: 'jsonb', nullable: true })
  transcription_timestamps: any; // For video/audio with time-coded transcripts

  @Column({ type: 'text', nullable: true })
  ocr_text: string; // For documents/images

  // Processing status
  @Column({ default: 'pending' })
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'jsonb', default: [] })
  processing_errors: string[];

  // Accessibility
  @Column({ type: 'text', nullable: true })
  alt_text: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  // Geographic data
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  location_name: string;
}
