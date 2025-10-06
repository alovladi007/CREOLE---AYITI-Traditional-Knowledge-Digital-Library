import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CREOLE Traditional Knowledge Digital Library API')
    .setDescription('API documentation for CREOLE TKDL platform - comprehensive endpoints for traditional knowledge management')
    .setVersion('2.0')
    .addTag('records', 'Traditional knowledge record operations')
    .addTag('search', 'Advanced search and discovery')
    .addTag('access', 'Access control and requests')
    .addTag('benefit', 'Benefit sharing and contracts')
    .addTag('media', 'Media upload and management')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('users', 'User profiles and management')
    .addTag('comments', 'Community comments and annotations')
    .addTag('export', 'Bulk export operations')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token from Keycloak'
      },
      'JWT-auth'
    )
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'http://localhost:8080/realms/creole/protocol/openid-connect/auth',
            tokenUrl: 'http://localhost:8080/realms/creole/protocol/openid-connect/token',
            scopes: {
              openid: 'OpenID',
              profile: 'Profile information',
              email: 'Email address',
            }
          }
        }
      },
      'OAuth2'
    )
    .addServer('http://localhost:4000', 'Development server')
    .addServer('https://api.creole-tkdl.org', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CREOLE API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    }
  });
}
