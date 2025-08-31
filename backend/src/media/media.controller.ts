import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'nest-keycloak-connect';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles({ roles: ['community_user', 'examiner', 'admin'] })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const media = await this.mediaService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      body.recordId,
    );

    return {
      id: media.id,
      key: media.key,
      filename: media.filename,
      size: media.size,
      sha256: media.sha256,
      redaction_status: media.redaction_status,
    };
  }

  @Get(':key/url')
  @Roles({ roles: ['community_user', 'examiner', 'admin'] })
  async getPresignedUrl(@Param('key') key: string) {
    const url = await this.mediaService.presignGetUrl(key);
    return { url };
  }

  @Post('redact-image')
  @Roles({ roles: ['community_user', 'examiner', 'admin'] })
  @UseInterceptors(FileInterceptor('file'))
  async redactImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const regions = JSON.parse(body.regions || '[]');
    const redactedBuffer = await this.mediaService.redactImage(file.buffer, regions);

    return {
      image_base64: redactedBuffer.toString('base64'),
      format: 'png',
      boxes: regions,
    };
  }
}