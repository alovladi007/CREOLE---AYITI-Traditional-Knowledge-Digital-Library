import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('v1/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('upload')
  @Roles({ roles: ['community_user','admin','examiner'] })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body('recordId') recordId?: string) {
    const saved = await this.media.uploadBuffer(file.buffer, file.originalname, file.mimetype, recordId);
    await this.media.redactAfterUpload(saved);
    return { 
      id: saved.id, 
      key: saved.key, 
      sha256: saved.sha256, 
      redaction_status: saved.redaction_status, 
      redaction_meta: saved.redaction_meta || null 
    };
  }

  @Get(':key/url')
  @Roles({ roles: ['community_user','admin','examiner'] })
  async url(@Param('key') key: string) {
    const url = await this.media.presignGetUrl(key);
    return { url };
  }

  @Post('redact-image')
  @Roles({ roles: ['community_user','admin','examiner'] })
  @UseInterceptors(FileInterceptor('file'))
  async redactImage(@UploadedFile() file: Express.Multer.File, @Body('regions') regions?: string) {
    const form = new FormData();
    // @ts-ignore
    form.append('file', new Blob([file.buffer]), file.originalname);
    form.append('regions', regions || '[]');
    const res = await fetch(
      (process.env.NLP_HOST ? `http://${process.env.NLP_HOST}:${process.env.NLP_PORT||'8000'}` : 'http://nlp:8000') + '/redact_image', 
      { method:'POST', body: form as any } as any
    );
    if (!res.ok) throw new Error('redact failed');
    const j:any = await res.json();
    return j;
  }
}