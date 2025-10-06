import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_locations')
export class RecordLocationEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ nullable: true })
  location_name: string;

  @Column({ nullable: true })
  location_type: 'origin' | 'practice_area' | 'sacred_site' | 'collection_site' | 'other';

  @Column({ type: 'text', nullable: true })
  description: string;

  // GeoJSON support for complex geometries
  @Column({ type: 'jsonb', nullable: true })
  geometry: {
    type: 'Point' | 'Polygon' | 'LineString' | 'MultiPoint';
    coordinates: number[] | number[][] | number[][][];
  };

  @Column({ type: 'int', nullable: true })
  radius_meters: number; // Approximate area radius

  @Column({ default: true })
  is_public: boolean; // Some locations may need to be kept secret
}
